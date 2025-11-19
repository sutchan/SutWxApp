import sys
import os
import chardet

def fix_file_encoding_and_line_endings(filepath):
    try:
        with open(filepath, 'rb') as f:
            content_bytes = f.read()

        # Try to decode with utf-8-sig to handle BOM, then other common encodings
        detected_encoding_info = chardet.detect(content_bytes)
        detected_encoding = detected_encoding_info['encoding']
        confidence = detected_encoding_info['confidence']
        content_str = None # Initialize content_str
        encodings_to_try = []

        # Prioritize common encodings first
        encodings_to_try.extend(['utf-8-sig', 'utf-8'])

        # Add chardet detected encoding if confidence is high
        if detected_encoding and isinstance(detected_encoding, str) and confidence > 0.8:
            encodings_to_try.insert(0, detected_encoding) # Insert at the beginning to prioritize
        
        # Add other common encodings
        encodings_to_try.extend(['gb18030', 'gb2312', 'gbk', 'latin-1'])
        
        # Remove duplicates while preserving order
        seen = set()
        encodings_to_try = [x for x in encodings_to_try if not (x in seen or seen.add(x))]

        for encoding in encodings_to_try:
            try:
                content_str = content_bytes.decode(encoding)
                print(f"Decoded with encoding: {encoding} (chardet detected: {detected_encoding})")
                break
            except UnicodeDecodeError:
                continue
        else:
            print(f"Could not decode {filepath} with any common encodings. Skipping.")
            return

        # Convert line endings to Unix LF
        content_str = content_str.replace('\r\n', '\n')
        content_str = content_str.replace('\r', '\n')

        with open(filepath, 'wb') as f:
            f.write(content_str.encode('utf-8'))
        print(f"Successfully processed: {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        for filepath in sys.argv[1:]:
            if os.path.exists(filepath):
                fix_file_encoding_and_line_endings(filepath)
            else:
                print(f"File not found: {filepath}")
    else:
        print("Usage: python fix_encoding.py <filepath1> [<filepath2> ...]")