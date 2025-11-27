import base64
import hashlib
import struct

# ใช้ key และ iv เดียวกับที่ใช้ใน Vue component
key_str = "my16charKey__123"  # 16 chars = 16 bytes
iv_str = "iv-1234567890-xyz"  # 16 chars = 16 bytes

key = key_str.encode('utf-8')  # แปลงเป็น bytes
iv = iv_str.encode('utf-8')    # แปลงเป็น bytes

# Simple AES implementation (สำหรับการทดลองเท่านั้น)
# ในโปรดักชันจริงควรใช้ library ที่ผ่านการตรวจสอบแล้ว

def xor_bytes(a, b):
    """XOR สอง byte array"""
    return bytes(x ^ y for x, y in zip(a, b))

def pkcs7_pad(data, block_size=16):
    """เพิ่ม PKCS7 padding"""
    padding_length = block_size - (len(data) % block_size)
    padding = bytes([padding_length] * padding_length)
    return data + padding

def pkcs7_unpad(data):
    """ลบ PKCS7 padding"""
    padding_length = data[-1]
    return data[:-padding_length]

# AES S-box
S_BOX = [
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

# Inverse S-box
INV_S_BOX = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
]

def galois_multiply(a, b):
    """คูณใน Galois Field GF(2^8)"""
    result = 0
    for _ in range(8):
        if b & 1:
            result ^= a
        high_bit = a & 0x80
        a <<= 1
        if high_bit:
            a ^= 0x1b
        b >>= 1
    return result & 0xff

class SimpleAES:
    def __init__(self, key):
        self.key = key
        self.round_keys = self._key_expansion()
    
    def _key_expansion(self):
        """สร้าง round keys"""
        round_keys = []
        round_keys.append(self.key)
        
        rcon = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]
        
        for i in range(10):  # AES-128 ใช้ 10 rounds
            prev_key = round_keys[i]
            new_key = bytearray(16)
            
            # หา word สุดท้าย
            temp = prev_key[12:16]
            
            # RotWord และ SubWord
            temp = bytes([temp[1], temp[2], temp[3], temp[0]])
            temp = bytes([S_BOX[b] for b in temp])
            
            # XOR กับ Rcon
            temp = bytes([temp[0] ^ rcon[i], temp[1], temp[2], temp[3]])
            
            # สร้าง new key
            for j in range(4):
                word_start = j * 4
                prev_word = prev_key[word_start:word_start+4]
                if j == 0:
                    new_word = xor_bytes(prev_word, temp)
                else:
                    new_word = xor_bytes(prev_word, new_key[(j-1)*4:j*4])
                new_key[word_start:word_start+4] = new_word
            
            round_keys.append(bytes(new_key))
        
        return round_keys
    
    def _sub_bytes(self, state):
        """SubBytes transformation"""
        return bytes([S_BOX[b] for b in state])
    
    def _inv_sub_bytes(self, state):
        """Inverse SubBytes transformation"""
        return bytes([INV_S_BOX[b] for b in state])
    
    def _shift_rows(self, state):
        """ShiftRows transformation"""
        # แปลงเป็น 4x4 matrix
        matrix = [list(state[i:i+4]) for i in range(0, 16, 4)]
        
        # Shift rows
        matrix[1] = matrix[1][1:] + matrix[1][:1]  # shift left by 1
        matrix[2] = matrix[2][2:] + matrix[2][:2]  # shift left by 2
        matrix[3] = matrix[3][3:] + matrix[3][:3]  # shift left by 3
        
        # แปลงกลับเป็น bytes
        return bytes([matrix[i][j] for i in range(4) for j in range(4)])
    
    def _inv_shift_rows(self, state):
        """Inverse ShiftRows transformation"""
        # แปลงเป็น 4x4 matrix
        matrix = [list(state[i:i+4]) for i in range(0, 16, 4)]
        
        # Inverse shift rows
        matrix[1] = matrix[1][-1:] + matrix[1][:-1]  # shift right by 1
        matrix[2] = matrix[2][-2:] + matrix[2][:-2]  # shift right by 2
        matrix[3] = matrix[3][-3:] + matrix[3][:-3]  # shift right by 3
        
        # แปลงกลับเป็น bytes
        return bytes([matrix[i][j] for i in range(4) for j in range(4)])
    
    def _mix_columns(self, state):
        """MixColumns transformation"""
        matrix = [list(state[i:i+4]) for i in range(0, 16, 4)]
        result = [[0]*4 for _ in range(4)]
        
        for col in range(4):
            column = [matrix[row][col] for row in range(4)]
            result[0][col] = galois_multiply(0x02, column[0]) ^ galois_multiply(0x03, column[1]) ^ column[2] ^ column[3]
            result[1][col] = column[0] ^ galois_multiply(0x02, column[1]) ^ galois_multiply(0x03, column[2]) ^ column[3]
            result[2][col] = column[0] ^ column[1] ^ galois_multiply(0x02, column[2]) ^ galois_multiply(0x03, column[3])
            result[3][col] = galois_multiply(0x03, column[0]) ^ column[1] ^ column[2] ^ galois_multiply(0x02, column[3])
        
        return bytes([result[i][j] for i in range(4) for j in range(4)])
    
    def _inv_mix_columns(self, state):
        """Inverse MixColumns transformation"""
        matrix = [list(state[i:i+4]) for i in range(0, 16, 4)]
        result = [[0]*4 for _ in range(4)]
        
        for col in range(4):
            column = [matrix[row][col] for row in range(4)]
            result[0][col] = galois_multiply(0x0e, column[0]) ^ galois_multiply(0x0b, column[1]) ^ galois_multiply(0x0d, column[2]) ^ galois_multiply(0x09, column[3])
            result[1][col] = galois_multiply(0x09, column[0]) ^ galois_multiply(0x0e, column[1]) ^ galois_multiply(0x0b, column[2]) ^ galois_multiply(0x0d, column[3])
            result[2][col] = galois_multiply(0x0d, column[0]) ^ galois_multiply(0x09, column[1]) ^ galois_multiply(0x0e, column[2]) ^ galois_multiply(0x0b, column[3])
            result[3][col] = galois_multiply(0x0b, column[0]) ^ galois_multiply(0x0d, column[1]) ^ galois_multiply(0x09, column[2]) ^ galois_multiply(0x0e, column[3])
        
        return bytes([result[i][j] for i in range(4) for j in range(4)])
    
    def encrypt_block(self, plaintext_block):
        """เข้ารหัส 1 block (16 bytes)"""
        state = plaintext_block
        
        # Initial round
        state = xor_bytes(state, self.round_keys[0])
        
        # Main rounds (1-9)
        for i in range(1, 10):
            state = self._sub_bytes(state)
            state = self._shift_rows(state)
            state = self._mix_columns(state)
            state = xor_bytes(state, self.round_keys[i])
        
        # Final round (10)
        state = self._sub_bytes(state)
        state = self._shift_rows(state)
        state = xor_bytes(state, self.round_keys[10])
        
        return state
    
    def decrypt_block(self, ciphertext_block):
        """ถอดรหัส 1 block (16 bytes)"""
        state = ciphertext_block
        
        # Initial round
        state = xor_bytes(state, self.round_keys[10])
        state = self._inv_shift_rows(state)
        state = self._inv_sub_bytes(state)
        
        # Main rounds (9-1)
        for i in range(9, 0, -1):
            state = xor_bytes(state, self.round_keys[i])
            state = self._inv_mix_columns(state)
            state = self._inv_shift_rows(state)
            state = self._inv_sub_bytes(state)
        
        # Final round
        state = xor_bytes(state, self.round_keys[0])
        
        return state

def encrypt(text: str) -> str:
    """
    เข้ารหัสข้อความด้วย AES-CBC mode
    
    Args:
        text (str): ข้อความที่ต้องการเข้ารหัส
        
    Returns:
        str: ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
    """
    aes = SimpleAES(key)
    
    # เพิ่ม padding
    padded_data = pkcs7_pad(text.encode('utf-8'))
    
    # เข้ารหัสแบบ CBC
    ciphertext = b''
    prev_block = iv
    
    for i in range(0, len(padded_data), 16):
        block = padded_data[i:i+16]
        # XOR กับ previous ciphertext (CBC mode)
        block = xor_bytes(block, prev_block)
        # เข้ารหัส block
        encrypted_block = aes.encrypt_block(block)
        ciphertext += encrypted_block
        prev_block = encrypted_block
    
    # แปลงเป็น Base64
    return base64.b64encode(ciphertext).decode('utf-8')

def decrypt(ciphertext_b64: str) -> str:
    """
    ถอดรหัสข้อความจาก Base64 ciphertext
    
    Args:
        ciphertext_b64 (str): ข้อความที่เข้ารหัสแล้วในรูปแบบ Base64
        
    Returns:
        str: ข้อความที่ถอดรหัสแล้ว
    """
    aes = SimpleAES(key)
    
    # แปลง Base64 กลับเป็น bytes
    ciphertext = base64.b64decode(ciphertext_b64)
    
    # ถอดรหัสแบบ CBC
    plaintext = b''
    prev_block = iv
    
    for i in range(0, len(ciphertext), 16):
        block = ciphertext[i:i+16]
        # ถอดรหัส block
        decrypted_block = aes.decrypt_block(block)
        # XOR กับ previous ciphertext (CBC mode)
        decrypted_block = xor_bytes(decrypted_block, prev_block)
        plaintext += decrypted_block
        prev_block = block
    
    # ลบ padding
    unpadded_plaintext = pkcs7_unpad(plaintext)
    
    return unpadded_plaintext.decode('utf-8')

if __name__ == "__main__":
    print("=== Simple AES Encryption (Pure Python) ===")
    print("หมายเหตุ: นี่เป็น implementation ง่ายๆ เพื่อการศึกษา")
    print("ในการใช้งานจริงควรใช้ library ที่ผ่านการตรวจสอบความปลอดภัยแล้ว")
    print()
    
    # ทดลองเข้ารหัส
    plaintext = "Hello from Python!"
    print(f"Original text: {plaintext}")
    
    try:
        # เข้ารหัส
        ciphertext_b64 = encrypt(plaintext)
        print(f"Base64 Ciphertext: {ciphertext_b64}")
        
        # ทดลองถอดรหัสเพื่อยืนยัน
        decrypted = decrypt(ciphertext_b64)
        print(f"Decrypted text: {decrypted}")
        print(f"Success: {plaintext == decrypted}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    
    # ทดสอบกับข้อความภาษาไทย
    try:
        thai_text = "สวัสดีจาก Python!"
        print(f"Thai text: {thai_text}")
        
        thai_ciphertext = encrypt(thai_text)
        print(f"Thai Base64 Ciphertext: {thai_ciphertext}")
        
        thai_decrypted = decrypt(thai_ciphertext)
        print(f"Thai Decrypted: {thai_decrypted}")
        print(f"Thai Success: {thai_text == thai_decrypted}")
        
    except Exception as e:
        print(f"Thai Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    print("คุณสามารถนำ Base64 Ciphertext ข้างต้นไปทดสอบใน Vue component ได้")
