import socket
# Thanks https://stackoverflow.com/a/20749411 for importing from a file
from common_ports import ports_and_services

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
        # First line of output
        output_str = "Open ports for "
        if target_type == "URL":
            output_str += f'{target} ({host})'
        else:
            try:
                # Thanks https://how.dev/answers/how-to-find-the-domain-name-using-an-ip-address-in-python for gethostbyaddr()
                url = socket.gethostbyaddr(host)[0]
                output_str += f'{url} ({host})'
            except socket.herror:
                output_str += f'{host}'

        # Second line
        output_str += "\nPORT     SERVICE"

        # Third and beyond lines
        for port in open_ports:
            # Print out port plus spacing to get to service line
            output_str += f'\n{port}'
            output_str += (4 - len(str(port))) * ' '
            output_str += "     "

            # For service, if it's not in ports_and_services array then print nothing
            try:
                output_str += ports_and_services[port]
            except KeyError:
                output_str += "       "
        
        return output_str

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
