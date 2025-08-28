import hashlib

def crack_sha1_hash(hash, use_salts = False):
    # Open password file for reading
    # Thanks https://www.geeksforgeeks.org/python/check-end-of-file-in-python/ for file method
    pw_file = open("top-10000-passwords.txt", "r")

    # Loop for each line in password file
    for line in pw_file:
        # Each line will have newline at end so need to remove that
        pw = line.split("\n")[0]
        
        # Thanks https://docs.python.org/3/library/hashlib.html for hashlib syntax
        # hashlib uses a byte string so pw needs to be encoded, thanks https://stackoverflow.com/a/6273618
        test_hash = hashlib.sha1(pw.encode('UTF-8')).hexdigest()
        if test_hash == hash:
            pw_file.close()
            return pw

    pw_file.close()
    return "PASSWORD NOT IN DATABASE"

print(crack_sha1_hash("b305921a3723cd5d70a375cd21a61e60aabb84ec"))
