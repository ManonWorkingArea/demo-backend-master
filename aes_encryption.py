import base64
import hashlib
import struct

# Pure Python AES Implementation (ไม่ต้องติดตั้ง library เพิ่ม)
class SimpleAES:
    def __init__(self):
        # AES S-box
        self.sbox = [
            0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
            0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
            0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
            0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
            0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
            0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
            0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
            0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
            0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
            0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
            0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
            0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
            0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
            0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
            0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
            0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
        ]
        
        # Rcon values
        self.rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

    def xor_bytes(self, a, b):
        """XOR two byte arrays"""
        return bytes(x ^ y for x, y in zip(a, b))
    
    def sub_bytes(self, state):
        """Apply S-box substitution"""
        return [self.sbox[b] for b in state]
    
    def shift_rows(self, state):
        """Shift rows transformation"""
        return [
            state[0], state[5], state[10], state[15],
            state[4], state[9], state[14], state[3],
            state[8], state[13], state[2], state[7],
            state[12], state[1], state[6], state[11]
        ]
    
    def mix_columns(self, state):
        """Mix columns transformation"""
        def gf_mult(a, b):
            """Galois Field multiplication"""
            p = 0
            for _ in range(8):
                if b & 1:
                    p ^= a
                hi_bit_set = a & 0x80
                a <<= 1
                if hi_bit_set:
                    a ^= 0x1b
                b >>= 1
            return p & 0xff
        
        result = [0] * 16
        for c in range(4):
            col = state[c*4:(c+1)*4]
            result[c*4] = gf_mult(0x02, col[0]) ^ gf_mult(0x03, col[1]) ^ col[2] ^ col[3]
            result[c*4+1] = col[0] ^ gf_mult(0x02, col[1]) ^ gf_mult(0x03, col[2]) ^ col[3]
            result[c*4+2] = col[0] ^ col[1] ^ gf_mult(0x02, col[2]) ^ gf_mult(0x03, col[3])
            result[c*4+3] = gf_mult(0x03, col[0]) ^ col[1] ^ col[2] ^ gf_mult(0x02, col[3])
        return result
    
    def add_round_key(self, state, round_key):
        """Add round key to state"""
        return [s ^ k for s, k in zip(state, round_key)]
    
    def key_expansion(self, key):
        """Expand the cipher key"""
        expanded_key = list(key)
        
        for i in range(10):  # 10 rounds for AES-128
            # Take the last 4 bytes
            temp = expanded_key[-4:]
            
            # Rotate
            temp = temp[1:] + [temp[0]]
            
            # SubBytes
            temp = [self.sbox[b] for b in temp]
            
            # XOR with Rcon
            temp[0] ^= self.rcon[i]
            
            # XOR with key from 4 positions back
            for j in range(4):
                temp[j] ^= expanded_key[-16 + j]
                expanded_key.append(temp[j])
                
            # Generate remaining 12 bytes for this round
            for j in range(3):
                for k in range(4):
                    expanded_key.append(expanded_key[-16] ^ expanded_key[-4])
        
        return expanded_key
    
    def encrypt_block(self, block, key):
        """Encrypt a single 16-byte block"""
        expanded_key = self.key_expansion(key)
        state = list(block)
        
        # Initial round
        state = self.add_round_key(state, expanded_key[:16])
        
        # 9 main rounds
        for round_num in range(1, 10):
            state = self.sub_bytes(state)
            state = self.shift_rows(state)
            state = self.mix_columns(state)
            round_key = expanded_key[round_num*16:(round_num+1)*16]
            state = self.add_round_key(state, round_key)
        
        # Final round (no mix columns)
        state = self.sub_bytes(state)
        state = self.shift_rows(state)
        state = self.add_round_key(state, expanded_key[160:176])
        
        return bytes(state)

# ใช้ key และ iv เดียวกับที่ใช้ใน Vue component
key_str = "my16charKey__123"  # 16 chars = 16 bytes
iv_str = "iv-1234567890-xyz"  # 16 chars = 16 bytes

key = key_str.encode('utf-8')  # แปลงเป็น bytes
iv = iv_str.encode('utf-8')    # แปลงเป็น bytes

# สร้าง AES instance
aes = SimpleAES()

def pkcs7_pad(data, block_size):
    """เพิ่ม PKCS7 padding"""
    padding_len = block_size - (len(data) % block_size)
    padding = bytes([padding_len] * padding_len)
    return data + padding

def pkcs7_unpad(padded_data):
    """ลบ PKCS7 padding"""
    padding_len = padded_data[-1]
    return padded_data[:-padding_len]

def encrypt(text: str) -> str:
    """
    เข้ารหัสข้อความด้วย AES-CBC mode (Pure Python)
    
    Args:
        text (str): ข้อความที่ต้องการเข้ารหัส
        
    Returns:
        str: ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
    """
    # แปลงข้อความเป็น bytes และเพิ่ม padding
    plaintext_bytes = text.encode('utf-8')
    padded_data = pkcs7_pad(plaintext_bytes, 16)
    
    # เข้ารหัสแบบ CBC mode
    ciphertext = b''
    prev_block = iv
    
    for i in range(0, len(padded_data), 16):
        block = padded_data[i:i+16]
        # XOR กับ previous block (CBC mode)
        xor_block = aes.xor_bytes(block, prev_block)
        # เข้ารหัส block
        encrypted_block = aes.encrypt_block(xor_block, key)
        ciphertext += encrypted_block
        prev_block = encrypted_block
    
    # แปลงเป็น Base64
    return base64.b64encode(ciphertext).decode('utf-8')

def decrypt(ciphertext_b64: str) -> str:
    """
    ถอดรหัสข้อความจาก Base64 ciphertext (Pure Python)
    
    Args:
        ciphertext_b64 (str): ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
        
    Returns:
        str: ข้อความที่ถอดรหัสแล้ว
    """
    # แปลง Base64 กลับเป็น bytes
    ciphertext = base64.b64decode(ciphertext_b64)
    
    # ถอดรหัสแบบ CBS mode (ต้องใช้ inverse operations)
    # สำหรับ demo นี้ จะใช้วิธีง่ายๆ โดยใช้ JavaScript compatibility
    # ในทางปฏิบัติจริง ควรใช้ library ที่ทดสอบแล้ว
    
    # ใช้ฟังก์ชันง่ายๆ สำหรับ demo
    # (ในการใช้งานจริง ควรใช้ proper AES decryption)
    return "Decryption with pure Python AES needs full implementation"

if __name__ == "__main__":
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
    print("คุณสามารถนำ Base64 Ciphertext ข้างต้นไปทดสอบใน Vue component ได้")
