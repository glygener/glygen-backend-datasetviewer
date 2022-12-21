import os,sys
import string
from optparse import OptionParser
import glob
import json
import subprocess

__version__="1.0"
__status__ = "Dev"



###############################
def main():


    config_obj = json.loads(open("./conf/config.json", "r").read())
    server = config_obj["server"]

    image = "glyds_%s_app" % (server) 
    container = "running_" + image
    port = config_obj["port"]
    data_path = config_obj["data_path"]
    
    cmd_list = []
    if os.path.isdir(data_path) == False:
        cmd_list.append("mkdir -p %s" % (data_path))

    cmd = "cp glyds.%s.env .env.production" % (server)
    cmd_list.append(cmd) 
    cmd = "npm run build"
    cmd_list.append(cmd)
    cmd = "docker build -t %s ." % (image)
    cmd_list.append(cmd)

    for c in [container]:
        cmd = "docker ps |grep %s" % (c)
        x = subprocess.getoutput(cmd).split(" ")[-1].strip()
        if x == c:
            cmd_list.append("docker rm -f %s " % (c))

    cmd = "docker run -dit --name %s -p 127.0.0.1:%s:80 -v %s:%s %s" % (container,port,data_path, data_path, image)
    cmd_list.append(cmd)

    for cmd in cmd_list:
        print (cmd)
        #x = subprocess.getoutput(cmd)
        #print (x)



if __name__ == '__main__':
    main()
