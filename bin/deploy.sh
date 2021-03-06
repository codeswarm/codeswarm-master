#!/bin/bash

function checkRoot() {
    if [[ "$USER" != "root" ]]; then
        echo "please run as: sudo $0"
        exit 1
    fi
}

function printHelp() {
    echo "usage: $0 -i <image> [-w <#workers>] [-v <data_directory>] [-c]"
    echo ""
    echo "  image: $buildname image from:"
    echo ""
}


function buildMaster(){

    if type "$docker" > /dev/null; then
        echo "Building Master"
        docker build -t master-$buildname:$buildver assets/dockerfiles/master/
        echo "Master Built"
    else
        echo "please install Docker, on debian: apt-get install docker || redhat/centos: yum install docker-io || Mac: http://docs.docker.io/installation/mac/"
        if [ "$(uname)" == "Darwin" ]; then
            open http://docs.docker.io/installation/mac/
        fi
    fi

}

function buildWorker(){

    if type "$docker" > /dev/null; then
        echo "Building Worker"
        docker build -t worker-$buildname:$buildver assets/dockerfiles/worker/
        echo "Worker Built"
    else
        echo "please install Docker, on debian: apt-get install docker || redhat/centos: yum install docker-io || Mac: http://docs.docker.io/installation/mac/"
        if [ "$(uname)" == "Darwin" ]; then
            open http://docs.docker.io/installation/mac/
        fi
    fi

}

function startMaster() {
    echo "starting master container"
    if [ "$DEBUG" -gt 0 ]; then
        echo sudo docker run -d  -h csmaster $VOLUME_MAP $1:$2
    fi
    MASTER=$(sudo docker run -d  -h csmaster $VOLUME_MAP $1:$2)

    if [ "$MASTER" = "" ]; then
        echo "error: could not start master container from image $1:$2"
        exit 1
    fi

    echo "started master container:      $MASTER"
    sleep 3
    MASTER_IP=$(sudo docker logs $MASTER 2>&1 | egrep '^MASTER_IP=' | awk -F= '{print $2}' | tr -d -c "[:digit:] .")
    echo "MASTER_IP:                     $MASTER_IP"
    echo "address=\"/master/$MASTER_IP\"" >> $DNSFILE
}

# starts a number of Spark/Shark workers
function startWorkers() {
    for i in `seq 1 $NUM_WORKERS`; do
        echo "starting worker container"
	hostname="worker${i}${DOMAINNAME}"
        if [ "$DEBUG" -gt 0 ]; then
	    echo sudo docker run -d --dns $NAMESERVER_IP -h $hostname $VOLUME_MAP $1:$2 ${MASTER_IP}
        fi
	WORKER=$(sudo docker run -d --dns $NAMESERVER_IP -h $hostname $VOLUME_MAP $1:$2 ${MASTER_IP})

        if [ "$WORKER" = "" ]; then
            echo "error: could not start worker container from image $1:$2"
            exit 1
        fi

	echo "started worker container:  $WORKER"
	sleep 3
	WORKER_IP=$(sudo docker logs $WORKER 2>&1 | egrep '^WORKER_IP=' | awk -F= '{print $2}' | tr -d -c "[:digit:] .")
	echo "address=\"/$hostname/$WORKER_IP\"" >> $DNSFILE
    done
}

function parse_options() {
    while getopts "i:w:cv:h" opt; do
        case $opt in
        i)
            echo "$OPTARG" | grep "master:" > /dev/null;
	    if [ "$?" -eq 0 ]; then
                image_type="master"
            fi
            echo "$OPTARG" | grep "worker:" > /dev/null;
            if [ "$?" -eq 0 ]; then
                image_type="worker"
            fi
	        image_name=$(echo "$OPTARG" | awk -F ":" '{print $1}')
            image_version=$(echo "$OPTARG" | awk -F ":" '{print $2}')
          ;;
        w)
            NUM_WORKERS=$OPTARG
          ;;
        h)
            print_help
            exit 0
          ;;
        c)
            start_shell=1
          ;;
        v)
            VOLUME_MAP=$OPTARG
          ;;
        esac
    done

    if [ "$image_type" == "?" ]; then
        echo "missing or invalid option: -i <image>"
        exit 1
    fi

    if [ ! "$VOLUME_MAP" == "" ]; then
        echo "data volume chosen: $VOLUME_MAP"
        VOLUME_MAP="-v $VOLUME_MAP:/data"
    fi
}