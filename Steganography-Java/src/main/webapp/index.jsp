%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Steganography System | Hide Secrets in Pixels</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- HEIC to PNG Converter -->
    <script src="https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js"></script>
    
    <style>
        :root {
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.1);
            --text-main: #f8fafc;
            --text-dim: #94a3b8;
            --success: #22c55e;
            --error: #ef4444;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
        }

        body {
            background: var(--bg-gradient);
            background-attachment: fixed;
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }

        .container {
            width: 100%;
            max-width: 900px;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 3rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        header {
            text-align: center;
            margin-bottom: 3rem;
        }

        header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(to right, #818cf8, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 0.5rem;
        }

        header p {
            color: var(--text-dim);
            font-size: 1.1rem;
        }

        /* Tabs */
        .tabs {
            display: flex;
            gap: 1rem;
            margin-bottom: 2.5rem;
            background: rgba(0, 0, 0, 0.2);
            padding: 0.5rem;
            border-radius: 16px;
        }

        .tab-btn {
            flex: 1;
            padding: 1rem;
            border: none;
            background: transparent;
            color: var(--text-dim);
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            border-radius: 12px;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .tab-btn.active {
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
            animation: slideUp 0.4s ease-out;
        }

        @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Form Elements */
        .form-group {
            margin-bottom: 1.5rem;
        }

        label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: var(--text-main);
        }

        input[type="text"],
        input[type="password"],
        textarea {
            width: 100%;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 1rem;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.3s;
        }

        input:focus, textarea:focus {
            border-color: var(--primary);
        }

        textarea {
            height: 120px;
            resize: none;
        }

        /* File Upload */
        .upload-area {
            border: 2px dashed var(--glass-border);
            border-radius: 16px;
            padding: 2.5rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            margin-bottom: 1.5rem;
            overflow: hidden;
        }

        .upload-area:hover {
            border-color: var(--primary);
            background: rgba(99, 102, 241, 0.05);
        }

        .upload-area i {
            font-size: 3rem;
            color: var(--primary);
            margin-bottom: 1rem;
        }

        .upload-area p {
            color: var(--text-dim);
        }

        .upload-area input[type="file"] {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            cursor: pointer;
        }

        .preview-img {
            max-width: 100%;
            max-height: 250px;
            border-radius: 12px;
            margin-top: 1rem;
            display: none;
            object-fit: contain;
        }

        /* Buttons */
        .submit-btn {
            width: 100%;
            background: var(--primary);
            color: white;
            border: none;
            padding: 1.2rem;
            border-radius: 14px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.7rem;
            margin-top: 2rem;
        }

        .submit-btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
        }

        /* Alerts */
        .alert {
            padding: 1rem 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: var(--error);
        }

        .alert-success {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.2);
            color: var(--success);
        }

        /* Result Section */
        .result-box {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            padding: 1.5rem;
            margin-top: 2rem;
            border: 1px solid var(--glass-border);
            position: relative;
        }

        .copy-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            padding: 0.5rem 0.8rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.8rem;
        }

        .copy-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .message-text {
            color: #fff;
            white-space: pre-wrap;
            word-break: break-all;
            line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 640px) {
            .container { padding: 1.5rem; }
            header h1 { font-size: 1.8rem; }
        }
    </style>
</head>
<body>

    <div class="container">
        <header>
            <h1>Secure Steganography</h1>
            <p>Cryptographically hide messages inside images</p>
        </header>

        <%-- Error/Success Messages --%>
        <% if (request.getParameter("error") != null) { %>
            <div class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span><%= request.getParameter("error") %></span>
            </div>
        <% } %>

        <% if (request.getParameter("success") != null) { %>
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <span><%= request.getParameter("success") %></span>
            </div>
        <% } %>

        <div class="tabs">
            <button class="tab-btn active" onclick="showTab('encode')">
                <i class="fas fa-lock"></i> Encode
            </button>
            <button class="tab-btn" onclick="showTab('decode')">
                <i class="fas fa-unlock"></i> Decode
            </button>
        </div>

        <!-- ENCODE TAB -->
        <div id="encode" class="tab-content active">
            <form action="encode" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Source Image (PNG/JPG)</label>
                    <div class="upload-area" id="drop-area-encode">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <p>Drag & Drop or Click to Upload</p>
                        <input type="file" name="image" accept="image/*" onchange="previewImage(this, 'preview-encode')" required>
                        <img id="preview-encode" class="preview-img" alt="Preview">
                    </div>
                </div>

                <div class="form-group">
                    <label>Secret Message</label>
                    <textarea name="message" placeholder="Type your secret message here..." required></textarea>
                </div>

                <div class="form-group">
                    <label>Encryption Password (Optional)</label>
                    <input type="password" name="password" placeholder="Leave blank for no encryption">
                </div>

                <button type="submit" class="submit-btn">
                    <i class="fas fa-cog"></i> Encode & Download PNG
                </button>
            </form>
        </div>

        <!-- DECODE TAB -->
        <div id="decode" class="tab-content">
            <form action="decode" method="POST" enctype="multipart/form-data">
                <div class="form-group">
                    <label>Encoded Image</label>
                    <div class="upload-area" id="drop-area-decode">
                        <i class="fas fa-file-image"></i>
                        <p>Drag & Drop Encoded Image</p>
                        <input type="file" name="image" accept="image/*" onchange="previewImage(this, 'preview-decode')" required>
                        <img id="preview-decode" class="preview-img" alt="Preview">
                    </div>
                </div>

                <div class="form-group">
                    <label>Decryption Password</label>
                    <input type="password" name="password" placeholder="Enter password if one was used">
                </div>

                <button type="submit" class="submit-btn">
                    <i class="fas fa-search"></i> Extract Message
                </button>
            </form>

            <%-- Decoded Result --%>
            <% 
                String decodedMsg = (String) session.getAttribute("decodedMessage");
                if (decodedMsg != null) {
            %>
                <div class="result-box">
                    <button class="copy-btn" onclick="copyToClipboard()">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                    <label style="color: var(--primary); font-size: 0.9rem;">Hidden Message Found:</label>
                    <div class="message-text" id="decoded-result"><%= decodedMsg %></div>
                </div>
            <% 
                    session.removeAttribute("decodedMessage"); // Clear after showing
                } 
            %>
        </div>
    </div>

    <script>
        // Tab switching logic
        function showTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(tabId).classList.add('active');
            event.currentTarget.classList.add('active');
            
            // Update URL hash without jumping
            history.pushState(null, null, '#' + tabId);
        }

        // Handle direct linking to tabs via hash
        window.addEventListener('DOMContentLoaded', () => {
            const hash = window.location.hash.replace('#', '');
            if (hash === 'decode') {
                showTab('decode');
                // find the button and make it active manually since event.currentTarget won't work
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    if(btn.innerText.includes('Decode')) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
            }
        });

        // Image Preview and HEIC Conversion logic
        async function previewImage(input, previewId) {
            const preview = document.getElementById(previewId);
            const statusText = input.parentElement.querySelector('p');
            const originalText = statusText.innerText;

            if (input.files && input.files[0]) {
                let file = input.files[0];
                const fileName = file.name.toLowerCase();

                // Check if it's HEIC/HEIF
                if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
                    try {
                        statusText.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting HEIC to PNG...';
                        statusText.style.color = 'var(--primary)';
                        
                        // Convert HEIC to PNG
                        const convertedBlob = await heic2any({
                            blob: file,
                            toType: "image/png",
                            quality: 1
                        });

                        // Create a new file from the blob to replace the input
                        const newFile = new File([convertedBlob], fileName.replace(/\.[^/.]+$/, "") + ".png", {
                            type: "image/png"
                        });

                        // Use DataTransfer to programmatically update the input file list
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(newFile);
                        input.files = dataTransfer.files;
                        
                        file = newFile;
                        statusText.innerHTML = '<i class="fas fa-check"></i> Converted Successfully!';
                        setTimeout(() => { statusText.innerText = originalText; }, 2000);
                    } catch (err) {
                        console.error(err);
                        statusText.innerHTML = '<i class="fas fa-times"></i> Conversion Failed';
                        statusText.style.color = 'var(--error)';
                        return;
                    }
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        }

        // Copy to clipboard
        function copyToClipboard() {
            const text = document.getElementById('decoded-result').innerText;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.style.background = '#22c55e';
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                    btn.style.background = 'rgba(255, 255, 255, 0.1)';
                }, 2000);
            });
        }

        // Simple Drag and Drop Highlight (Visual only)
        ['drop-area-encode', 'drop-area-decode'].forEach(id => {
            const area = document.getElementById(id);
            if(!area) return;
            
            ['dragenter', 'dragover'].forEach(eventName => {
                area.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    area.style.borderColor = 'var(--primary)';
                    area.style.background = 'rgba(99, 102, 241, 0.1)';
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                area.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    area.style.borderColor = 'var(--glass-border)';
                    area.style.background = 'transparent';
                }, false);
            });
        });
    </script>
</body>
</html>
