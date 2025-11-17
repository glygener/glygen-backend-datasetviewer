import os,sys
import string
from optparse import OptionParser
import json
import subprocess
import requests

__version__="1.0"
__status__ = "Dev"



###############################
def main():

    usage = "\n%prog  [options]"
    parser = OptionParser(usage,version="%prog version___")
    parser.add_option("-s","--server",action="store",dest="server",help="dev/tst/beta/prd")
    parser.add_option("-v","--dataversion",action="store",dest="dataversion",help="2.0.2/2.0.3 ...")
     
    (options,args) = parser.parse_args()

    for key in ([options.server, options.dataversion]):
        if not (key):
            parser.print_help()
            sys.exit(0)

    server = options.server

    ver = options.dataversion
    
    config_obj = json.loads(open("./conf/config.json", "r").read())
    log_dir = config_obj["data_path"] + "/logs/"
    userdata_dir = config_obj["data_path"] + "/userdata/%s/jobs/" % (server)
    
    for d in [log_dir, userdata_dir]:
        if os.path.isdir(d) == False:
            cmd = "mkdir -p %s" % (d)
            x = subprocess.getoutput(cmd)

    rel_dir = config_obj["data_path"] + "/releases/data/v-%s/" % (ver)
    if os.path.isdir(rel_dir) == True:
        cmd = "rm -rf " + rel_dir
        x = subprocess.getoutput(cmd)
    
    cmd = "mkdir -p %s" % (rel_dir)
    x = subprocess.getoutput(cmd)
    if os.path.isdir(rel_dir) == False:
        print ("\t\nCould not create directory %s!\n" % (jsondb_dir))
        exit()

    os.chdir(rel_dir)
    for d in config_obj["downloads"]["jsondb"] + config_obj["downloads"]["others"]:
        file_name = "%s.tar.gz" % (d)
        url = "https://data.glygen.org/ftp/v-%s/%s.tar.gz" % (ver, d)
        print (" ... downloading %s" % (url))
        r = requests.get(url, allow_redirects=True)
        open(file_name, 'wb').write(r.content)
        cmd = "tar xvfz %s" % (file_name)
        x = subprocess.getoutput(cmd)
        #print (x)
        cmd = "rm -f %s" % (file_name)
        x = subprocess.getoutput(cmd)
        print ("done!")
    



if __name__ == '__main__':
    main()
