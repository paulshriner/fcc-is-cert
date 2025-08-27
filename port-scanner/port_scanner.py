import socket

def get_open_ports(target, port_range, verbose = False):
    # Get type of input
    target_type = url_or_ip(target)
    
    # Check if input is valid (if URL this also gets IP), if invalid return error
    try:
        host = socket.gethostbyname(target)
    except socket.gaierror:
        return f'Error: Invalid {"hostname" if target_type == "URL" else "IP address"}'
    
    open_ports = []

    return(open_ports)

# Helper function to check if passed value is an IP (IPv4) or URL
def url_or_ip(target):
    # Split based on IP format (111.111.111.111)
    split_str = target.split('.')

    # There should be 4 sections, if not return URL
    if len(split_str) != 4:
        return "URL"
    
    for part in split_str:
        # Try converting each part to a number, if that fails return URL
        try:
            num = int(part)

            # Check to ensure num is valid (0-999), if not return URL
            if num < 0 or num > 999:
                return "URL"
        except ValueError:
            return "URL"

    return "IP"

print(get_open_ports("111.111.111.111", [0, 3000]))
