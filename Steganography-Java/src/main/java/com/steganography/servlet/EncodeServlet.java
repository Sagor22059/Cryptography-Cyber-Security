package com.steganography.servlet;

import com.steganography.util.ImageSteganographyUtil;

import javax.imageio.ImageIO;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.OutputStream;

@WebServlet("/encode")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 2, // 2MB
        maxFileSize = 1024 * 1024 * 50,      // 50MB
        maxRequestSize = 1024 * 1024 * 100   // 100MB
)
public class EncodeServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            // Get form fields
            Part filePart = request.getPart("image");
            String message = request.getParameter("message");
            String password = request.getParameter("password");

            if (filePart == null || filePart.getSize() == 0 || message == null || message.isEmpty()) {
                response.sendRedirect("index.jsp?error=Missing image or message");
                return;
            }

            // Read uploaded image
            String fileName = getFileName(filePart);
            System.out.println("Uploading file: " + fileName);
            System.out.println("Content Type: " + filePart.getContentType());
            System.out.println("File Size: " + filePart.getSize() + " bytes");

            BufferedImage srcImage = ImageIO.read(filePart.getInputStream());
            if (srcImage == null) {
                System.err.println("FAILED: ImageIO.read returned null for " + fileName);
                response.sendRedirect("index.jsp?error=Invalid image format: " + fileName);
                return;
            }

            // Perform Steganography
            BufferedImage encodedImage = ImageSteganographyUtil.encodeMessage(srcImage, message, password);

            // Set response headers for download
            response.setContentType("image/png");
            response.setHeader("Content-Disposition", "attachment; filename=\"encoded_image.png\"");

            // Write image to response stream
            try (OutputStream out = response.getOutputStream()) {
                ImageIO.write(encodedImage, "png", out);
            }

        } catch (IllegalArgumentException e) {
            response.sendRedirect("index.jsp?error=" + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("index.jsp?error=Encoding failed: " + e.getMessage());
        }
    }

    /**
     * Utility method to extract file name from HTTP header content-disposition
     */
    private String getFileName(Part part) {
        String contentDisp = part.getHeader("content-disposition");
        String[] tokens = contentDisp.split(";");
        for (String token : tokens) {
            if (token.trim().startsWith("filename")) {
                return token.substring(token.indexOf("=") + 2, token.length() - 1);
            }
        }
        return "unknown";
    }
}
