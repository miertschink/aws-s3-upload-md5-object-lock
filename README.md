# aws-s3-upload-md5-object-lock
a short snippet how to upload a file to S3 with object lock using the AWS SKD in nodejs


This is a typescript version of how one can upload a file to S3 with object lock enabled.

Object lock enabled requires a md5 hash of the file to be uploaded. This is a short snippet how to do it.

Creating the md5 hash means to process the stream, but the stream is also needed to be passed to the upload.

Therefore a copy of the stream is created via Passthrough stream.

This can also be used when you creating a stream via a library that creates a stream like PDFKit
