import sys
import os
import chardet
import multiprocessing
import time

# Define a timeout for processing each file (in seconds)
FILE_PROCESSING_TIMEOUT = 30

def _process_file_target(filepath, output_queue):
    try:
        with open(filepath, 'rb') as f:
            content_bytes = f.read()

        detected_encoding_info = chardet.detect(content_bytes)
        detected_encoding = detected_encoding_info['encoding']
        confidence = detected_encoding_info['confidence']
        content_str = None
        encodings_to_try = []

        encodings_to_try.extend(['utf-8-sig', 'utf-8'])

        if detected_encoding and isinstance(detected_encoding, str) and confidence > 0.8:
            encodings_to_try.insert(0, detected_encoding)
        
        encodings_to_try.extend(['gb18030', 'gb2312', 'gbk', 'latin-1'])
        
        seen = set()
        encodings_to_try = [x for x in encodings_to_try if not (x in seen or seen.add(x))]

        for encoding in encodings_to_try:
            try:
                content_str = content_bytes.decode(encoding)
                output_queue.put(f"Decoded with encoding: {encoding} (chardet detected: {detected_encoding})")
                break
            except UnicodeDecodeError:
                continue
        else:
            output_queue.put(f"Could not decode {filepath} with any common encodings. Skipping.")
            return

        content_str = content_str.replace('\r\n', '\n')
        content_str = content_str.replace('\r', '\n')

        with open(filepath, 'wb') as f:
            f.write(content_str.encode('utf-8'))
        output_queue.put(f"Successfully processed: {filepath}")
    except Exception as e:
        output_queue.put(f"Error processing {filepath}: {e}")

def fix_file_encoding_and_line_endings(filepath):
    output_queue = multiprocessing.Queue()
    process = multiprocessing.Process(target=_process_file_target, args=(filepath, output_queue))
    process.start()
    process.join(timeout=FILE_PROCESSING_TIMEOUT)

    if process.is_alive():
        process.terminate()
        process.join()
        print(f"Processing of {filepath} timed out after {FILE_PROCESSING_TIMEOUT} seconds. Skipping.", file=sys.stderr)
    else:
        while not output_queue.empty():
            message = output_queue.get()
            if message.startswith("Error") or message.startswith("Could not decode") or message.startswith("Processing of"): # Check for error messages
                print(message, file=sys.stderr)
            else:
                print(message)

if __name__ == "__main__":
    # This is necessary for multiprocessing to work correctly on Windows
    multiprocessing.freeze_support()
    if len(sys.argv) > 1:
        for filepath in sys.argv[1:]:
            if os.path.exists(filepath):
                fix_file_encoding_and_line_endings(filepath)
            else:
                print(f"File not found: {filepath}", file=sys.stderr)
    else:
        print("Usage: python fix_encoding.py <filepath1> [<filepath2> ...]")