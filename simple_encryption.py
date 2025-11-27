import base64
import hashlib
import struct

# ใช้ key และ iv เดียวกับที่ใช้ใน Vue component
key_str = "my16charKey__123"  # 16 chars = 16 bytes
iv_str = "iv-1234567890-xyz"  # 16 chars = 16 bytes

def simple_xor_encrypt(text: str, key_str: str) -> str:
    """
    เข้ารหัสแบบ XOR cipher ง่ายๆ (ไม่ใช่ AES แต่เป็น demo)
    
    Args:
        text (str): ข้อความที่ต้องการเข้ารหัส
        key_str (str): คีย์สำหรับเข้ารหัส
        
    Returns:
        str: ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
    """
    # แปลงเป็น bytes
    text_bytes = text.encode('utf-8')
    key_bytes = key_str.encode('utf-8')
    
    # XOR encryption
    encrypted = bytearray()
    for i, byte in enumerate(text_bytes):
        key_byte = key_bytes[i % len(key_bytes)]
        encrypted.append(byte ^ key_byte)
    
    # แปลงเป็น Base64
    return base64.b64encode(encrypted).decode('utf-8')

def simple_xor_decrypt(ciphertext_b64: str, key_str: str) -> str:
    """
    ถอดรหัส XOR cipher
    
    Args:
        ciphertext_b64 (str): ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
        key_str (str): คีย์สำหรับถอดรหัส
        
    Returns:
        str: ข้อความที่ถอดรหัสแล้ว
    """
    # แปลง Base64 กลับเป็น bytes
    encrypted = base64.b64decode(ciphertext_b64)
    key_bytes = key_str.encode('utf-8')
    
    # XOR decryption (เหมือนกับ encryption)
    decrypted = bytearray()
    for i, byte in enumerate(encrypted):
        key_byte = key_bytes[i % len(key_bytes)]
        decrypted.append(byte ^ key_byte)
    
    return decrypted.decode('utf-8')

# ใช้ hashlib สำหรับสร้าง cipher ที่ซับซ้อนขึ้น
def hash_based_encrypt(text: str, key_str: str, iv_str: str) -> str:
    """
    เข้ารหัสโดยใช้ hash-based method
    
    Args:
        text (str): ข้อความที่ต้องการเข้ารหัส
        key_str (str): คีย์สำหรับเข้ารหัส
        iv_str (str): Initial Vector
        
    Returns:
        str: ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
    """
    # สร้าง hash จาก key และ iv
    hash_input = (key_str + iv_str).encode('utf-8')
    cipher_key = hashlib.sha256(hash_input).digest()
    
    # แปลงข้อความเป็น bytes
    text_bytes = text.encode('utf-8')
    
    # เข้ารหัสโดยใช้ XOR กับ hash
    encrypted = bytearray()
    for i, byte in enumerate(text_bytes):
        key_byte = cipher_key[i % len(cipher_key)]
        encrypted.append(byte ^ key_byte)
    
    # แปลงเป็น Base64
    return base64.b64encode(encrypted).decode('utf-8')

def hash_based_decrypt(ciphertext_b64: str, key_str: str, iv_str: str) -> str:
    """
    ถอดรหัส hash-based method
    
    Args:
        ciphertext_b64 (str): ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
        key_str (str): คีย์สำหรับถอดรหัส
        iv_str (str): Initial Vector
        
    Returns:
        str: ข้อความที่ถอดรหัสแล้ว
    """
    # สร้าง hash จาก key และ iv
    hash_input = (key_str + iv_str).encode('utf-8')
    cipher_key = hashlib.sha256(hash_input).digest()
    
    # แปลง Base64 กลับเป็น bytes
    encrypted = base64.b64decode(ciphertext_b64)
    
    # ถอดรหัสโดยใช้ XOR กับ hash
    decrypted = bytearray()
    for i, byte in enumerate(encrypted):
        key_byte = cipher_key[i % len(cipher_key)]
        decrypted.append(byte ^ key_byte)
    
    return decrypted.decode('utf-8')

if __name__ == "__main__":
    print("=== Simple XOR Encryption ===")
    
    # ทดลองเข้ารหัสแบบ XOR
    plaintext = "Hello from Python!"
    print(f"Original text: {plaintext}")
    
    # เข้ารหัส XOR
    xor_ciphertext = simple_xor_encrypt(plaintext, key_str)
    print(f"XOR Base64 Ciphertext: {xor_ciphertext}")
    
    # ถอดรหัส XOR
    try:
        xor_decrypted = simple_xor_decrypt(xor_ciphertext, key_str)
        print(f"XOR Decrypted: {xor_decrypted}")
        print(f"XOR Success: {plaintext == xor_decrypted}")
    except Exception as e:
        print(f"XOR Decryption error: {e}")
    
    print("\n" + "="*60)
    print("=== Hash-based Encryption ===")
    
    # ทดลองเข้ารหัสแบบ hash-based
    hash_ciphertext = hash_based_encrypt(plaintext, key_str, iv_str)
    print(f"Hash Base64 Ciphertext: {hash_ciphertext}")
    
    # ถอดรหัส hash-based
    try:
        hash_decrypted = hash_based_decrypt(hash_ciphertext, key_str, iv_str)
        print(f"Hash Decrypted: {hash_decrypted}")
        print(f"Hash Success: {plaintext == hash_decrypted}")
    except Exception as e:
        print(f"Hash Decryption error: {e}")
    
    print("\n" + "="*60)
    
    # ทดสอบกับข้อความภาษาไทย
    thai_text = "สวัสดีจาก Python!"
    print(f"Thai text: {thai_text}")
    
    # Hash-based encryption กับภาษาไทย
    thai_hash_ciphertext = hash_based_encrypt(thai_text, key_str, iv_str)
    print(f"Thai Hash Base64 Ciphertext: {thai_hash_ciphertext}")
    
    try:
        thai_hash_decrypted = hash_based_decrypt(thai_hash_ciphertext, key_str, iv_str)
        print(f"Thai Hash Decrypted: {thai_hash_decrypted}")
        print(f"Thai Hash Success: {thai_text == thai_hash_decrypted}")
    except Exception as e:
        print(f"Thai Hash Decryption error: {e}")
    
    print("\n" + "="*60)
    print("*** หมายเหตุ: นี่เป็นการเข้ารหัสแบบง่ายๆ สำหรับการเรียนรู้ ***")
    print("*** ไม่ใช่ AES จริง ถ้าต้องการความปลอดภัยสูง ควรใช้ library ที่ถูกต้อง ***")
    print("*** คุณสามารถนำ Base64 Ciphertext ไปทดสอบได้ แต่อาจจะไม่ทำงานกับ Vue component ***")
    print("*** เพราะ Vue component ใช้ AES จริง ***")
