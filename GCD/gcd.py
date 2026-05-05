"""
Euclidean Algorithm for GCD (Greatest Common Divisor)
and Extended Euclidean Algorithm for finding coefficients
"""


def gcd(a, b):
    """
    Calculate the Greatest Common Divisor using the Euclidean algorithm.
    
    Args:
        a: First integer
        b: Second integer
    
    Returns:
        The GCD of a and b
    
    Time Complexity: O(log(min(a, b)))
    Space Complexity: O(log(min(a, b))) due to recursion
    """
    if b == 0:
        return a
    return gcd(b, a % b)


def gcd_iterative(a, b):
    """
    Calculate the Greatest Common Divisor using iterative approach.
    
    Args:
        a: First integer
        b: Second integer
    
    Returns:
        The GCD of a and b
    
    Time Complexity: O(log(min(a, b)))
    Space Complexity: O(1)
    """
    while b != 0:
        a, b = b, a % b
    return a


def extended_gcd(a, b):
    """
    Extended Euclidean Algorithm - finds GCD and coefficients x, y
    such that: a*x + b*y = gcd(a, b)
    
    Args:
        a: First integer
        b: Second integer
    
    Returns:
        Tuple (gcd, x, y) where:
        - gcd is the greatest common divisor of a and b
        - x, y are integers satisfying: a*x + b*y = gcd
    
    Time Complexity: O(log(min(a, b)))
    Space Complexity: O(log(min(a, b))) due to recursion
    """
    if b == 0:
        return a, 1, 0
    
    gcd_value, x1, y1 = extended_gcd(b, a % b)
    
    # Update x and y using the recursive relation
    x = y1
    y = x1 - (a // b) * y1
    
    return gcd_value, x, y


def extended_gcd_iterative(a, b):
    """
    Extended Euclidean Algorithm - iterative approach.
    Finds GCD and coefficients x, y such that: a*x + b*y = gcd(a, b)
    
    Args:
        a: First integer
        b: Second integer
    
    Returns:
        Tuple (gcd, x, y) where:
        - gcd is the greatest common divisor of a and b
        - x, y are integers satisfying: a*x + b*y = gcd
    
    Time Complexity: O(log(min(a, b)))
    Space Complexity: O(1)
    """
    old_r, r = a, b
    old_s, s = 1, 0
    old_t, t = 0, 1
    
    while r != 0:
        quotient = old_r // r
        old_r, r = r, old_r - quotient * r
        old_s, s = s, old_s - quotient * s
        old_t, t = t, old_t - quotient * t
    
    return old_r, old_s, old_t


