'use strict';

exports.handler = async (event, context, callback) => {
  console.log('Event: ', JSON.stringify(event.Records[0].cf));

  const request = event.Records[0].cf.request;
  const origin = event.Records[0].cf.request.origin.custom;
  const uri = request.uri;

  if(uri === '/get'){
    request.uri = '/';
    origin.path = '/version1/search';
    console.log('Origin path', origin.path);
  } else if (uri === '/s3'){
    request.uri = '/index.html';
    const s3DomainName = 'uthairat-staticwebsite-bucket.s3.amazonaws.com';

    request.origin ={
      s3: {
        domainName: s3DomainName,
        region: '',
        authMethod: 'none',
        path: '/main',
        customHeaders: {}
      }
    };
    request.headers['host'] = [{ key: 'host', value: s3DomainName}];
  }
  return request;
};
