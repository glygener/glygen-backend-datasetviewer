import requests
import glob

url = "http://localhost:8081/dataset/upload"


in_file = "queries/G17689DH.png"
files = {"file": open(in_file, 'rb')}
req_obj = {"format":"png", "qctype":"basic", "dataversion":"1.12.3"}
r = requests.post(url, files=files, data=req_obj)
print (r.text)
exit()


file_list = glob.glob("temp/*_glygen.csv")
for in_file in file_list:
    files = {"file": open(in_file, 'rb')}
    req_obj = {"format":"csv", "qctype":"glyco_site_unicarbkb", "dataversion":"1.12.1"}
    r = requests.post(url, files=files, data=req_obj)
    out_file = ".".join(in_file.split(".")[:-1]) + ".json"
    with open(out_file, "w") as FW:
        FW.write("%s\n" % (r.text))
    print ("Saved response in %s" % (out_file))


