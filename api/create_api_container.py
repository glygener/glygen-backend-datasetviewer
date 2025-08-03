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

    usage = "\n%prog  [options]"
    parser = OptionParser(usage,version="%prog version___")
    parser.add_option("-p","--project",action="store",dest="project",help="glyds/argosdb/airmd")
    parser.add_option("-s","--server",action="store",dest="server",help="dev/tst/beta/prd")
    (options,args) = parser.parse_args()

    for key in ([options.project, options.server]):
        if not (key):
            parser.print_help()
            sys.exit(0)

    server = options.server
    project = options.project

    config_file = "conf/config_%s.json" % (project)
    config_obj = json.loads(open(config_file, "r").read())
    image = "%s_api_%s" % (project, server) 
    api_container = "running_" + image
    mongo_container = "running_"+ project +"_mongo_" + server
    api_port = config_obj["api_port"][server]

    db_name = "glydb_beta" if server == "beta" else "glydb"
    mongo_user = config_obj["dbinfo"][db_name]["user"]
    mongo_password = config_obj["dbinfo"][db_name]["password"]
    mongo_db =  config_obj["dbinfo"][db_name]["db"]
    

    data_path = config_obj["data_path"]
    #network = config_obj["dbinfo"]["bridge_network"] + "_" + server
    mail_server = config_obj["mail"]["server"]
    mail_port = config_obj["mail"]["port"]
    mail_sender = config_obj["mail"]["sender"]

    host_ip = config_obj["host_ip"][server]
    #conn_str = "mongodb://%s:%s@%s:27017/?authSource=%s" % (mongo_user, mongo_password, mongo_container, mongo_db)
    conn_str = "mongodb://%s:%s@%s:27017/?authSource=%s" % (mongo_user, mongo_password, host_ip, mongo_db)


    cmd_list = []
    if os.path.isdir(data_path) == False:
        cmd_list.append("mkdir -p %s" % (data_path))

    cmd_list.append("python3 setup.py bdist_wheel")
    cmd_list.append("docker build --network=host -t %s ." % (image))
    for c in [api_container]:
        cmd = "docker ps --all |grep %s" % (c)
        container_id = subprocess.getoutput(cmd).split(" ")[0].strip()
        if container_id.strip() != "":
            cmd_list.append("docker rm -f %s " % (container_id))


    #cmd = "docker create --name %s --network %s -p 127.0.0.1:%s:80" % (api_container, network, api_port)
    cmd = "docker create --name %s -p 127.0.0.1:%s:80" % (api_container, api_port)
    cmd += " -v %s:%s -v /software/pipes:/hostpipe -e MONGODB_CONNSTRING=%s -e DB_NAME=%s " % (data_path, data_path, conn_str, mongo_db)
    cmd += " -e MAIL_SERVER=%s -e MAIL_PORT=%s -e MAIL_SENDER=%s -e DATA_PATH=%s -e SERVER=%s %s" % (mail_server, mail_port, mail_sender, data_path, server, image) 
    
    cmd_list.append(cmd)



    for cmd in cmd_list:
        x = subprocess.getoutput(cmd)
        print (x)

    #remove dangling images
    cmd = "docker images -f dangling=true"
    line_list = subprocess.getoutput(cmd).split("\n")
    for line in line_list[1:]:
        image_id = line.split()[2]
        cmd = "docker image rm -f " + image_id
        x = subprocess.getoutput(cmd)


if __name__ == '__main__':
    main()
