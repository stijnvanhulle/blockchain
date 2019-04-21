#!/usr/bin/env bash


fileName="$BITBUCKET_BUILD_NUMBER-$BITBUCKET_COMMIT"

if [ "$BITBUCKET_TAG" != "" ]
then
    
    export s3_location=s3://$S3_BUCKET/$APPLICATION_NAME/$BITBUCKET_TAG/$fileName.zip
    export s3_key=$APPLICATION_NAME/$BITBUCKET_TAG/$fileName.zip
else
    export s3_location=s3://$S3_BUCKET/$APPLICATION_NAME/builds/$fileName.zip
    export s3_key=$APPLICATION_NAME/builds/$fileName.zip
fi

echo $s3_location
echo $s3_key