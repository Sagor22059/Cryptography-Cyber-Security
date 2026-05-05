"""
Flask Web Application for GCD and Extended GCD Calculator
"""

from flask import Flask, render_template, request, jsonify
from gcd import gcd, extended_gcd

app = Flask(__name__)


@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')


@app.route('/api/gcd', methods=['POST'])
def calculate_gcd():
    """Calculate GCD"""
    try:
        data = request.json
        a = int(data.get('a', 0))
        b = int(data.get('b', 0))
        
        if a == 0 and b == 0:
            return jsonify({'error': 'Both numbers cannot be zero'}), 400
        
        result = gcd(abs(a), abs(b))
        
        return jsonify({
            'a': a,
            'b': b,
            'gcd': result,
            'steps': generate_gcd_steps(abs(a), abs(b))
        })
    except ValueError:
        return jsonify({'error': 'Invalid input. Please enter integers.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/extended-gcd', methods=['POST'])
def calculate_extended_gcd():
    """Calculate Extended GCD"""
    try:
        data = request.json
        a = int(data.get('a', 0))
        b = int(data.get('b', 0))
        
        if a == 0 and b == 0:
            return jsonify({'error': 'Both numbers cannot be zero'}), 400
        
        gcd_val, x, y = extended_gcd(abs(a), abs(b))
        
        # Adjust signs if needed
        if a < 0:
            x = -x
        if b < 0:
            y = -y
        
        verification = a * x + b * y
        
        return jsonify({
            'a': a,
            'b': b,
            'gcd': gcd_val,
            'x': x,
            'y': y,
            'equation': f"{a}×{x} + {b}×{y} = {verification}",
            'verification': verification
        })
    except ValueError:
        return jsonify({'error': 'Invalid input. Please enter integers.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500



def generate_gcd_steps(a, b):
    """Generate step-by-step GCD calculation"""
    steps = []
    original_a, original_b = a, b
    
    while b != 0:
        quotient = a // b
        remainder = a % b
        steps.append({
            'a': a,
            'b': b,
            'quotient': quotient,
            'remainder': remainder,
            'equation': f"{a} = {b} × {quotient} + {remainder}"
        })
        a, b = b, remainder
    
    return {
        'initial': f"GCD({original_a}, {original_b})",
        'steps': steps,
        'result': a
    }



if __name__ == '__main__':
    print("=" * 60)
    print("GCD Calculator Web Application")
    print("=" * 60)
    print("\nStarting Flask server...")
    print("Open your browser and go to: http://127.0.0.1:5000")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60 + "\n")
    
    app.run(debug=True, port=5000)
