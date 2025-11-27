import base64
import hashlib
import secrets
import struct

# ใช้ key และ iv เดียวกับที่ใช้ใน Vue component
key_str = "my16charKey__123"  # 16 chars = 16 bytes
iv_str = "iv-1234567890-xyz"  # 16 chars = 16 bytes

def create_stream_cipher(key_str: str, iv_str: str, length: int) -> bytes:
    """
    สร้าง stream cipher จาก key และ iv โดยใช้ hashlib
    """
    cipher_stream = bytearray()
    counter = 0
    
    while len(cipher_stream) < length:
        # สร้าง hash จาก key + iv + counter
        hash_input = f"{key_str}{iv_str}{counter}".encode('utf-8')
        hash_bytes = hashlib.sha256(hash_input).digest()
        cipher_stream.extend(hash_bytes)
        counter += 1
    
    return bytes(cipher_stream[:length])

def stream_encrypt(text: str, key_str: str, iv_str: str) -> str:
    """
    เข้ารหัสด้วย stream cipher ที่สร้างจาก hash
    
    Args:
        text (str): ข้อความที่ต้องการเข้ารหัส
        key_str (str): คีย์สำหรับเข้ารหัส
        iv_str (str): Initial Vector
        
    Returns:
        str: ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
    """
    # แปลงข้อความเป็น bytes
    text_bytes = text.encode('utf-8')
    
    # สร้าง stream cipher
    cipher_stream = create_stream_cipher(key_str, iv_str, len(text_bytes))
    
    # XOR กับ stream cipher
    encrypted = bytearray()
    for i, byte in enumerate(text_bytes):
        encrypted.append(byte ^ cipher_stream[i])
    
    # แปลงเป็น Base64
    return base64.b64encode(encrypted).decode('utf-8')

def stream_decrypt(ciphertext_b64: str, key_str: str, iv_str: str) -> str:
    """
    ถอดรหัส stream cipher
    
    Args:
        ciphertext_b64 (str): ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
        key_str (str): คีย์สำหรับถอดรหัส
        iv_str (str): Initial Vector
        
    Returns:
        str: ข้อความที่ถอดรหัสแล้ว
    """
    # แปลง Base64 กลับเป็น bytes
    encrypted = base64.b64decode(ciphertext_b64)
    
    # สร้าง stream cipher เดียวกัน
    cipher_stream = create_stream_cipher(key_str, iv_str, len(encrypted))
    
    # XOR กับ stream cipher (การถอดรหัสเหมือนกับการเข้ารหัส)
    decrypted = bytearray()
    for i, byte in enumerate(encrypted):
        decrypted.append(byte ^ cipher_stream[i])
    
    return decrypted.decode('utf-8')

# ฟังก์ชันหลักที่จะใช้
def encrypt(text: str) -> str:
    """
    เข้ารหัสข้อความ (ใช้ stream cipher แทน AES)
    """
    return stream_encrypt(text, key_str, iv_str)

def decrypt(ciphertext_b64: str) -> str:
    """
    ถอดรหัสข้อความ (ใช้ stream cipher แทน AES)
    """
    return stream_decrypt(ciphertext_b64, key_str, iv_str)

if __name__ == "__main__":
    print("=== Pure Python Stream Cipher (Hash-based) ===")
    print("ใช้ built-in libraries เท่านั้น: base64, hashlib")
    print()
    
    # ทดลองเข้ารหัส
    plaintext = "Hello from Python!"
    print(f"Original text: {plaintext}")
    
    # เข้ารหัส
    ciphertext_b64 = encrypt(plaintext)
    print(f"Base64 Ciphertext: {ciphertext_b64}")
    
    # ทดลองถอดรหัสเพื่อยืนยัน
    try:
        decrypted = decrypt(ciphertext_b64)
        print(f"Decrypted text: {decrypted}")
        print(f"Success: {plaintext == decrypted}")
    except Exception as e:
        print(f"Decryption error: {e}")
    
    print("\n" + "="*50)
    
    # ทดสอบกับข้อความภาษาไทย
    thai_text = "สวัสดีจาก Python!"
    print(f"Thai text: {thai_text}")
    
    thai_ciphertext = encrypt(thai_text)
    print(f"Thai Base64 Ciphertext: {thai_ciphertext}")
    
    try:
        thai_decrypted = decrypt(thai_ciphertext)
        print(f"Thai Decrypted: {thai_decrypted}")
        print(f"Thai Success: {thai_text == thai_decrypted}")
    except Exception as e:
        print(f"Thai Decryption error: {e}")
    
    print("\n" + "="*50)
    
    # ทดสอบกับข้อความยาวๆ
    long_text = "This is a longer message to test the encryption and decryption process. " * 3
    print(f"Long text length: {len(long_text)} characters")
    
    long_ciphertext = encrypt(long_text)
    print(f"Long Base64 Ciphertext: {long_ciphertext[:50]}...{long_ciphertext[-20:]}")
    
    try:
        long_decrypted = decrypt(long_ciphertext)
        print(f"Long Success: {long_text == long_decrypted}")
        print(f"Long Decrypted (first 50 chars): {long_decrypted[:50]}...")
    except Exception as e:
        print(f"Long Decryption error: {e}")
    
    print("\n" + "="*50)
    print("Configuration:")
    print(f"Key: {key_str}")
    print(f"IV: {iv_str}")
    print()
    print("*** หมายเหตุ ***")
    print("- นี่เป็น Stream Cipher ที่สร้างจาก SHA-256 hash")
    print("- ไม่ใช่ AES จริง แต่ใช้ built-in libraries เท่านั้น")
    print("- เหมาะสำหรับการเรียนรู้และทดสอบ")
    print("- Ciphertext จะไม่สามารถถอดรหัสด้วย Vue component ได้")
    print("- เพราะ Vue component ใช้ AES-CBC จริง")
    print("- หากต้องการความปลอดภัยสูง ควรใช้ library ที่ผ่านการทดสอบแล้ว")
