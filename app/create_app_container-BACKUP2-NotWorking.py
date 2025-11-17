import os,sys
import string
from optparse import OptionParser
import glob
import json
import subprocess

__version__="1.0"
__status__ = "Dev"


def create_docker_file(prj):

    line_list = [
        "FROM nginx:1.21.0-alpine as production"
        ,"ENV NODE_ENV production"
        ,"RUN mkdir -p /data/shared/%s" % (prj)
        ,"RUN ln -s /data/shared/%s /usr/share/nginx/html/ln2data" % (prj)
        ,"RUN ln -s /data/shared/%s/releases /usr/share/nginx/html/ln2releases" % (prj)
        ,"RUN ln -s /data/shared/%s/downloads /usr/share/nginx/html/ln2downloads" % (prj)
        ,"RUN ln -s /data/shared/%s/releases/ftp /usr/share/nginx/html/ftp" % (prj)
        ,"COPY ./build /usr/share/nginx/html"
        ,"COPY ./static/html/actinomycetes/ /usr/share/nginx/html/actinomycetes/"
        ,"COPY ./static/html/bacillaceae/ /usr/share/nginx/html/bacillaceae/"
        ,"COPY ./static/html/bacteroidota/ /usr/share/nginx/html/bacteroidota/"
        ,"COPY ./static/html/escherichia/ /usr/share/nginx/html/escherichia/"
        ,"COPY ./static/html/eukaryota/ /usr/share/nginx/html/eukaryota/"
        ,"COPY ./static/html/klebsiella/ /usr/share/nginx/html/klebsiella/"
        ,"COPY ./static/html/lactobacillales/ /usr/share/nginx/html/lactobacillales/"
        ,"COPY ./static/html/alphaproteobacteria/ /usr/share/nginx/html/alphaproteobacteria/"
        ,"COPY ./static/html/betaproteobacteria/ /usr/share/nginx/html/betaproteobacteria/"
        ,"COPY ./static/html/enterobacteriaceae/ /usr/share/nginx/html/enterobacteriaceae/"
        ,"COPY ./static/html/gammaproteobacteria/ /usr/share/nginx/html/gammaproteobacteria/"
        ,"COPY ./static/html/other/ /usr/share/nginx/html/other/"
        ,"COPY ./static/html/saccharomyces/ /usr/share/nginx/html/saccharomyces/"
        ,"COPY ./static/html/salmonella/ /usr/share/nginx/html/salmonella/"
        ,"COPY ./static/html/staphylococcus/ /usr/share/nginx/html/staphylococcus/"
        ,"COPY ./static/html/viruses/ /usr/share/nginx/html/viruses/"
        ,"COPY nginx.conf /etc/nginx/conf.d/default.conf"
        ,"COPY nginx.conf /etc/nginx/conf.d/default.conf"
        ,"EXPOSE 80"
        ,"CMD [\"nginx\", \"-g\", \"daemon off;\"]"
    ]
    with open("Dockerfile", "w") as FW:
        FW.write("%s\n" % ("\n\n".join(line_list)))
    return

###############################
def main():

    # Ensure cwd is the repository root
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    os.chdir(repo_root)
    print("Working directory:", os.getcwd(), flush=True)

    usage = "\n%prog  [options]"
    parser = OptionParser(usage,version="%prog version___")
    parser.add_option("-s","--server",action="store",dest="server",help="dev/tst/beta/prd")
    (options,args) = parser.parse_args()

    for key in ([options.server]):
        if not (key):
            parser.print_help()
            sys.exit(0)

    server = options.server


    config_obj = json.loads(open("app/conf/config.json", "r").read())

    image = "dsviewer_app_%s" % (server) 
    container = "running_" + image
    app_port = config_obj["app_port"][server]
    data_path = config_obj["data_path"]
   
    with open(".env.production", "w") as FW:
        FW.write("REACT_APP_SERVER=%s\n" % (server))
        FW.write("REACT_APP_ROOT_URL=%s\n" % (config_obj["app_root"][server]))
        FW.write("REACT_APP_API_URL=%s\n" % (config_obj["api_root"][server]))
        FW.write("REACT_APP_APP_VERSION=1.1\n")


    create_docker_file("argosdb")

    cmd_list = []
    if os.path.isdir(data_path) == False:
        cmd_list.append("mkdir -p %s" % (data_path))

    cmd = "node scripts/build_stats.js"
    cmd_list.append(cmd)
    "npm --prefix app ci || npm --prefix app install"
    cmd_list.append(cmd)
    cmd = "npm --prefix app run build"
    cmd_list.append(cmd)
    cmd = "docker build --pull --no-cache -t %s app" % (image)
    cmd_list.append(cmd)

    for c in [container]:
        cmd = "docker ps --all |grep %s" % (c)
        container_id = subprocess.getoutput(cmd).split(" ")[0].strip()
        if container_id.strip() != "":
            cmd_list.append("docker rm -f %s " % (container_id))

    cmd = "docker create --name %s -p 127.0.0.1:%s:80 -v %s:%s %s" % (container,app_port,data_path, data_path, image)
    cmd_list.append(cmd)

    for cmd in cmd_list:
        #print (cmd)
        x = subprocess.getoutput(cmd)
        print (x)
    




if __name__ == '__main__':
    main()
