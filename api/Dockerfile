FROM python:3.6.8

WORKDIR /app

ENV FLASK_APP=dsviewer

ENV FLASK_ENV=production

#COPY ./tools/ts-1.0.2.tar.gz .
#COPY ./tools/ncbi-blast-2.6.0+-x64-linux.tar.gz .
#COPY ./tools/job_submitters.tar.gz .
#RUN /bin/tar xvf ts-1.0.2.tar.gz
#RUN /bin/tar xvf ncbi-blast-2.6.0+-x64-linux.tar.gz
#RUN /bin/tar xvf job_submitters.tar.gz
#WORKDIR /app/ts-1.0.2
#RUN make 
#RUN make install

WORKDIR /app

COPY ./requirements.txt .

RUN pip3 install -r requirements.txt

COPY ./dist/dsviewer-1.0-py3-none-any.whl .

RUN pip3 install dsviewer-1.0-py3-none-any.whl

#RUN mkdir -p /data/shared/glyds

RUN mkdir -p /usr/local/var/dsviewer-instance

COPY ./instance/config.py /usr/local/var/dsviewer-instance/config.py

COPY . .

ENTRYPOINT FLASK_APP=dsviewer gunicorn -b :80 'dsviewer:create_app()'

