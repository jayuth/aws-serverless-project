#!/bin/bash
request_num=1000;
concurrent_num=(50 100 200 300)
declare -a request_url=("https://d159m1e7k7qaku.cloudfront.net/get" "https://s634zoh0d3.execute-api.us-east-1.amazonaws.com/version1/search")
declare -a header=("userlatitude: 39.030899999999995" "userlongitude: -84.4667831" "userrestaurant: mexcican")

for((i=0; i<${#concurrent_num[*]}; i++))
do
  for ((j=0; j <${#request_url[*]}; j++));
  do
    printf "n=${request_num}, c=${concurrent_num[i]}, request url: ${request_url[j]} \n"
    ab -n $request_num -c ${concurrent_num[i]} -H \""${header[0]}"\" -H \""${header[1]}"\" -H \""${header[2]}"\" ${request_url[j]} | grep 'Failed requests\|Time per request'
    printf "\n"
  done
done
