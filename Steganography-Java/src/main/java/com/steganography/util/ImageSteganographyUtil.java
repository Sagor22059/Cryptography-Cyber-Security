package com.steganography.util;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.awt.image.BufferedImage;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.security.spec.KeySpec;
import java.util.Arrays;
import java.util.Base64;

/**
 * ImageSteganographyUtil.java
 * ─────────────────────────────────────────────────────────────────────────────
 * Core utility class for the Secure Image Steganography System.
 *
 * Techniques used:
 *  • LSB (Least Significant Bit) steganography — modifies the lowest bit of
 *    each R, G, B channel to embed message bits with minimal visual distortion.
 *  • AES-256-CBC encryption (PBKDF2 key derivation) — when a password is
 *    supplied the payload is encrypted before embedding.
 *
 * Bit layout inside the image:
 *  Pixels 0-31  → 32-bit integer: total payload byte-length (big-endian).
 *  Pixels 32+   → payload bits, one bit per LSB of R, G, B channels.
 *
 * Author : Secure Steganography System
 * Version: 1.0
 * ─────────────────────────────────────────────────────────────────────────────
 */
public class ImageSteganographyUtil {

    // ── AES constants ────────────────────────────────────────────────────────
    private static final String AES_ALGO       = "AES/CBC/PKCS5Padding";
    private static final String KDF_ALGO        = "PBKDF2WithHmacSHA256";
    private static final int    KDF_ITERATIONS  = 65_536;
    private static final int    AES_KEY_BITS    = 256;
    private static final int    SALT_BYTES      = 16;  // 128-bit salt
    private static final int    IV_BYTES        = 16;  // 128-bit IV

    // ── Sentinel prefix written into the payload ─────────────────────────────
    // Used to verify a correct password during decode.
    private static final String MAGIC = "STEG::";

    // ── Capacity guard ────────────────────────────────────────────────────────
    /** Returns the maximum payload bytes that fit in the image (LSB, 3 channels). */
    public static int maxBytes(BufferedImage img) {
        // 3 bits per pixel (R,G,B LSBs), first 32 pixels reserved for length
        return ((img.getWidth() * img.getHeight() - 32) * 3) / 8;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ENCODE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Embeds {@code message} into {@code src} and returns a new BufferedImage
     * containing the hidden payload.
     *
     * @param src      Source image (PNG preferred; JPG lossy re-encoding will
     *                 corrupt the payload — the caller must save as PNG).
     * @param message  Plain-text message to hide.
     * @param password Optional password. Pass {@code null} or empty for no
     *                 encryption.
     * @return A new BufferedImage with the message embedded.
     * @throws Exception on encryption or capacity errors.
     */
    public static BufferedImage encodeMessage(BufferedImage src,
                                              String message,
                                              String password) throws Exception {

        // 1. Build payload: MAGIC + message
        String plainPayload = MAGIC + message;

        byte[] payloadBytes;
        if (password != null && !password.isEmpty()) {
            // Encrypt with AES-CBC, prepend salt+IV
            payloadBytes = encrypt(plainPayload.getBytes(StandardCharsets.UTF_8), password);
        } else {
            payloadBytes = plainPayload.getBytes(StandardCharsets.UTF_8);
        }

        // 2. Capacity check
        int capacity = maxBytes(src);
        if (payloadBytes.length > capacity) {
            throw new IllegalArgumentException(
                "Message too large for this image. Max " + capacity +
                " bytes, but payload is " + payloadBytes.length + " bytes.");
        }

        // 3. Copy source image to a new RGB BufferedImage (avoids ARGB issues)
        int w = src.getWidth(), h = src.getHeight();
        BufferedImage dest = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                dest.setRGB(x, y, src.getRGB(x, y));
            }
        }

        // 4. Encode payload length into first 32 pixels (96 LSBs → 32-bit int)
        int len = payloadBytes.length;
        writeBitsToImage(dest, 0, intToBits(len), 32);

        // 5. Encode payload bytes starting at pixel 32
        boolean[] payloadBits = bytesToBits(payloadBytes);
        writeBitsToImage(dest, 32, payloadBits, payloadBits.length);

        return dest;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DECODE
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Extracts and returns the hidden message from {@code src}.
     *
     * @param src      Image containing an embedded payload.
     * @param password Password used during encoding, or {@code null}/empty if
     *                 no encryption was applied.
     * @return Plain-text message.
     * @throws Exception if decoding fails (wrong password, no payload, etc.).
     */
    public static String decodeMessage(BufferedImage src, String password) throws Exception {

        // 1. Read payload length from first 32 pixels
        boolean[] lenBits = readBitsFromImage(src, 0, 32);
        int len = bitsToInt(lenBits);

        if (len <= 0 || len > maxBytes(src)) {
            throw new IllegalStateException(
                "No valid steganographic payload found in this image.");
        }

        // 2. Read payload bits
        boolean[] payloadBits = readBitsFromImage(src, 32, len * 8);
        byte[] payloadBytes   = bitsToBytes(payloadBits);

        // 3. Decrypt if password provided
        String plainText;
        if (password != null && !password.isEmpty()) {
            byte[] decrypted = decrypt(payloadBytes, password);
            plainText = new String(decrypted, StandardCharsets.UTF_8);
        } else {
            plainText = new String(payloadBytes, StandardCharsets.UTF_8);
        }

        // 4. Validate magic prefix
        if (!plainText.startsWith(MAGIC)) {
            throw new SecurityException(
                "Incorrect password or image contains no valid hidden message.");
        }

        return plainText.substring(MAGIC.length());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LSB helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Writes {@code count} bits into image LSBs starting at pixel
     * {@code startPixel}, using R→G→B channel order, row-major.
     */
    private static void writeBitsToImage(BufferedImage img,
                                          int startPixel,
                                          boolean[] bits,
                                          int count) {
        int w = img.getWidth(), h = img.getHeight();
        int bitIndex = 0;

        outer:
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int pixelIndex = y * w + x;
                if (pixelIndex < startPixel) continue;
                if (bitIndex >= count) break outer;

                int rgb = img.getRGB(x, y);
                int r   = (rgb >> 16) & 0xFF;
                int g   = (rgb >> 8)  & 0xFF;
                int b   =  rgb        & 0xFF;

                if (bitIndex < count) { r = setLSB(r, bits[bitIndex++]); }
                if (bitIndex < count) { g = setLSB(g, bits[bitIndex++]); }
                if (bitIndex < count) { b = setLSB(b, bits[bitIndex++]); }

                img.setRGB(x, y, (r << 16) | (g << 8) | b);
            }
        }
    }

    /**
     * Reads {@code bitCount} LSBs from image starting at pixel
     * {@code startPixel}, using R→G→B channel order, row-major.
     */
    private static boolean[] readBitsFromImage(BufferedImage img,
                                                int startPixel,
                                                int bitCount) {
        boolean[] bits = new boolean[bitCount];
        int w = img.getWidth(), h = img.getHeight();
        int bitIndex = 0;

        outer:
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int pixelIndex = y * w + x;
                if (pixelIndex < startPixel) continue;
                if (bitIndex >= bitCount) break outer;

                int rgb = img.getRGB(x, y);
                int r   = (rgb >> 16) & 0xFF;
                int g   = (rgb >> 8)  & 0xFF;
                int b   =  rgb        & 0xFF;

                if (bitIndex < bitCount) { bits[bitIndex++] = getLSB(r); }
                if (bitIndex < bitCount) { bits[bitIndex++] = getLSB(g); }
                if (bitIndex < bitCount) { bits[bitIndex++] = getLSB(b); }
            }
        }
        return bits;
    }

    // ── Bit manipulation helpers ──────────────────────────────────────────────

    private static int setLSB(int channel, boolean bit) {
        return bit ? (channel | 1) : (channel & ~1);
    }

    private static boolean getLSB(int channel) {
        return (channel & 1) == 1;
    }

    private static boolean[] intToBits(int value) {
        boolean[] bits = new boolean[32];
        for (int i = 31; i >= 0; i--) {
            bits[31 - i] = ((value >> i) & 1) == 1;
        }
        return bits;
    }

    private static int bitsToInt(boolean[] bits) {
        int value = 0;
        for (int i = 0; i < 32; i++) {
            if (bits[i]) value |= (1 << (31 - i));
        }
        return value;
    }

    private static boolean[] bytesToBits(byte[] bytes) {
        boolean[] bits = new boolean[bytes.length * 8];
        for (int i = 0; i < bytes.length; i++) {
            for (int j = 7; j >= 0; j--) {
                bits[i * 8 + (7 - j)] = ((bytes[i] >> j) & 1) == 1;
            }
        }
        return bits;
    }

    private static byte[] bitsToBytes(boolean[] bits) {
        byte[] bytes = new byte[bits.length / 8];
        for (int i = 0; i < bytes.length; i++) {
            for (int j = 7; j >= 0; j--) {
                if (bits[i * 8 + (7 - j)]) {
                    bytes[i] |= (byte) (1 << j);
                }
            }
        }
        return bytes;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AES-256-CBC Encryption / Decryption  (PBKDF2 key derivation)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Encrypts {@code plaintext} with AES-256-CBC.
     * Output format: [16-byte salt][16-byte IV][ciphertext]
     */
    private static byte[] encrypt(byte[] plaintext, String password) throws Exception {
        SecureRandom rng  = new SecureRandom();
        byte[]       salt = new byte[SALT_BYTES];
        byte[]       iv   = new byte[IV_BYTES];
        rng.nextBytes(salt);
        rng.nextBytes(iv);

        SecretKey key = deriveKey(password, salt);
        Cipher cipher = Cipher.getInstance(AES_ALGO);
        cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(iv));
        byte[] ciphertext = cipher.doFinal(plaintext);

        // Concatenate: salt + iv + ciphertext
        byte[] result = new byte[SALT_BYTES + IV_BYTES + ciphertext.length];
        System.arraycopy(salt,       0, result, 0,                       SALT_BYTES);
        System.arraycopy(iv,         0, result, SALT_BYTES,              IV_BYTES);
        System.arraycopy(ciphertext, 0, result, SALT_BYTES + IV_BYTES,   ciphertext.length);
        return result;
    }

    /**
     * Decrypts data produced by {@link #encrypt(byte[], String)}.
     */
    private static byte[] decrypt(byte[] data, String password) throws Exception {
        if (data.length < SALT_BYTES + IV_BYTES) {
            throw new SecurityException("Corrupted payload or wrong decryption mode.");
        }
        byte[] salt       = Arrays.copyOfRange(data, 0, SALT_BYTES);
        byte[] iv         = Arrays.copyOfRange(data, SALT_BYTES, SALT_BYTES + IV_BYTES);
        byte[] ciphertext = Arrays.copyOfRange(data, SALT_BYTES + IV_BYTES, data.length);

        SecretKey key = deriveKey(password, salt);
        Cipher cipher = Cipher.getInstance(AES_ALGO);
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
        return cipher.doFinal(ciphertext);
    }

    /** Derives a 256-bit AES key from {@code password} and {@code salt} via PBKDF2. */
    private static SecretKey deriveKey(String password, byte[] salt) throws Exception {
        SecretKeyFactory factory = SecretKeyFactory.getInstance(KDF_ALGO);
        KeySpec          spec    = new PBEKeySpec(
                password.toCharArray(), salt, KDF_ITERATIONS, AES_KEY_BITS);
        byte[] keyBytes = factory.generateSecret(spec).getEncoded();
        return new SecretKeySpec(keyBytes, "AES");
    }
}
