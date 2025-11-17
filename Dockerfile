FROM nginx:1.21.0-alpine as production

ENV NODE_ENV production

RUN mkdir -p /data/shared/argosdb

RUN ln -s /data/shared/argosdb /usr/share/nginx/html/ln2data

RUN ln -s /data/shared/argosdb/releases /usr/share/nginx/html/ln2releases

RUN ln -s /data/shared/argosdb/downloads /usr/share/nginx/html/ln2downloads

RUN ln -s /data/shared/argosdb/releases/ftp /usr/share/nginx/html/ftp

COPY ./build /usr/share/nginx/html

COPY ./static/html/actinomycetes/ /usr/share/nginx/html/actinomycetes/

COPY ./static/html/bacillaceae/ /usr/share/nginx/html/bacillaceae/

COPY ./static/html/bacteroidota/ /usr/share/nginx/html/bacteroidota/

COPY ./static/html/escherichia/ /usr/share/nginx/html/escherichia/

COPY ./static/html/eukaryota/ /usr/share/nginx/html/eukaryota/

COPY ./static/html/klebsiella/ /usr/share/nginx/html/klebsiella/

COPY ./static/html/lactobacillales/ /usr/share/nginx/html/lactobacillales/

COPY ./static/html/alphaproteobacteria/ /usr/share/nginx/html/alphaproteobacteria/

COPY ./static/html/betaproteobacteria/ /usr/share/nginx/html/betaproteobacteria/

COPY ./static/html/enterobacteriaceae/ /usr/share/nginx/html/enterobacteriaceae/

COPY ./static/html/gammaproteobacteria/ /usr/share/nginx/html/gammaproteobacteria/

COPY ./static/html/other/ /usr/share/nginx/html/other/

COPY ./static/html/saccharomyces/ /usr/share/nginx/html/saccharomyces/

COPY ./static/html/salmonella/ /usr/share/nginx/html/salmonella/

COPY ./static/html/staphylococcus/ /usr/share/nginx/html/staphylococcus/

COPY ./static/html/viruses/ /usr/share/nginx/html/viruses/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
