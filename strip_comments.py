import os
import re

def remove_comments(text):
    text = re.sub(r'/\*[\s\S]*?\*/', '', text)
    text = re.sub(r'(?<!:)\/\/.*', '', text)
    # clean up empty lines if there are too many, but that's optional
    return text

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if 'dist' in dirs:
            dirs.remove('dist')
        if '.git' in dirs:
            dirs.remove('.git')
        
        for file in files:
            if file.endswith('.js') or file.endswith('.jsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = remove_comments(content)
                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Removed comments from {filepath}")

process_dir('.')
