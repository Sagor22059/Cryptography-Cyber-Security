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

@WebServlet("/decode")
@MultipartConfig(
        fileSizeThreshold = 1024 * 1024 * 2, // 2MB
        maxFileSize = 1024 * 1024 * 50,      // 50MB
        maxRequestSize = 1024 * 1024 * 100   // 100MB
)
public class DecodeServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Part filePart = request.getPart("image");
            String password = request.getParameter("password");

            if (filePart == null || filePart.getSize() == 0) {
                response.sendRedirect("index.jsp?error=Missing image");
                return;
            }

            // Read uploaded image
            BufferedImage srcImage = ImageIO.read(filePart.getInputStream());
            if (srcImage == null) {
                response.sendRedirect("index.jsp?error=Invalid image format");
                return;
            }

            // Extract message
            String decodedMessage = ImageSteganographyUtil.decodeMessage(srcImage, password);

            // Store message in session or pass as attribute (session is safer for a quick redirect)
            request.getSession().setAttribute("decodedMessage", decodedMessage);
            response.sendRedirect("index.jsp?success=Message decoded successfully#decode");

        } catch (SecurityException e) {
            response.sendRedirect("index.jsp?error=Incorrect password or no hidden message found#decode");
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("index.jsp?error=Decoding failed: " + e.getMessage() + "#decode");
        }
    }
}
