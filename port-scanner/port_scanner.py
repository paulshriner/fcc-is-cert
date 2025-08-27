import socket

def get_open_ports(target, port_range, verbose = False):
    # Get type of input
    target_type = url_or_ip(target)

    # Check if input is valid (if URL this also gets IP), if invalid return error
    try:
        host = socket.gethostbyname(target)
    except socket.gaierror:
        return f'Error: Invalid {"hostname" if target_type == "URL" else "IP address"}'
    
    # Check that port range is valid
    try:
        port1 = int(port_range[0])
        port2 = int(port_range[1])

        if port1 < 0 or port2 < 0:
            return "Error: Invalid port range"
    except IndexError:
        return "Error: Invalid port range"
    except ValueError:
        return "Error: Invalid port range"
    
    open_ports = []
    for port in range(port1, port2 + 1):
        # Create socket, set timeout in seconds
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        
        # if connect_ex did not return error then port is open, add port to open_ports
        if not s.connect_ex((host, port)):
            open_ports.append(port)

        # Close the socket
        # Thanks https://code.activestate.com/recipes/408997-when-to-not-just-use-socketclose/ for .close()
        s.close()
    
    # Return verbose output if user selected that
    if verbose:
        pass

    return open_ports

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

print(get_open_ports("www.freecodecamp.org", [440, 445]))
