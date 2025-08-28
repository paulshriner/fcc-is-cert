import hashlib

def crack_sha1_hash(hash, use_salts = False):
    # Open password file for reading
    # Thanks https://www.geeksforgeeks.org/python/check-end-of-file-in-python/ for file method
    try:
        pw_file = open("top-10000-passwords.txt", "r")
    except FileNotFoundError:
        return "Error: top-10000-passwords.txt not found"

    # Loop for each line in password file
    for line in pw_file:
        # Each line will have newline at end so need to remove that
        pw = line.split("\n")[0]

        if use_salts:
            # Open salt file and read each line, same as pw file
            try:
                salt_file = open("known-salts.txt", "r")
            except FileNotFoundError:
                return "Error: known-salts.txt not found"

            for line2 in salt_file:
                salt = line2.split("\n")[0]

                # Thanks https://docs.python.org/3/library/hashlib.html for hashlib syntax
                # hashlib uses a byte string so pw needs to be encoded, thanks https://stackoverflow.com/a/6273618
                # Prepends salt
                test_hash = hashlib.sha1((salt + pw).encode('UTF-8')).hexdigest()
                if test_hash == hash:
                    break

                # Appends salt
                test_hash = hashlib.sha1((pw + salt).encode('UTF-8')).hexdigest()
                if test_hash == hash:
                    break                

            salt_file.close()
        else:
            test_hash = hashlib.sha1(pw.encode('UTF-8')).hexdigest()
        
        if test_hash == hash:
            pw_file.close()
            return pw

    pw_file.close()
    return "PASSWORD NOT IN DATABASE"
