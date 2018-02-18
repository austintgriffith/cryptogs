const fs = require("fs")
const awsCreds = JSON.parse(fs.readFileSync("aws.json").toString().trim())
//https://github.com/andrewrk/node-s3-client
var s3 = require('s3');

var client = s3.createClient({
  s3Options: awsCreds,
});

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var params = {
  localDir: "build",

  s3Params: {
    Bucket: "cryptogs.io",
    Prefix: "",
    ACL: "public-read"
    // other options supported by putObject, except Body and ContentLength.
    // See: http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property
  },
};

//run the build for create react app
const { exec } = require('child_process');

console.log("BUILDING AND DEPLOYING TO https://cryptogs.io  -- run: 'ipfs daemon' to deploy to ipfs and 'node invalidate.js' to invalidate the cache.... ")

console.log("npm run build")
exec('npm run build', (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    if(err){
      console.log("ERROR ON BUILD",err)
    }
    return;
  }

  // the *entire* stdout and stderr (buffered)
  console.log(`${stdout}`);
  console.log(`${stderr}`);

  //clean out / so it works on nested locations like ipfs
  let index = fs.readFileSync("build/index.html").toString();
  index = index.split("\"\/").join("\"");
  console.log(index);
  fs.writeFileSync("build/index.html",index);

  fs.readdir( params.localDir , function( err, files ) {
      //the deployment address needs to be here so this needs to happen from the live box!
      if( err ) {
          console.error( "Could not list the directory.", err );
          process.exit( 1 );
      }

      //no need to do this now that psd files are moved out of public
      // files.forEach( function( file, index ) {
      //   if(file.indexOf(".psd")>=0){
      //     console.log(file,index)
      //     fs.unlinkSync(params.localDir+"/"+file)
      //   }
      // })

      var uploader = client.uploadDir(params);
      uploader.on('error', function(err) {
        console.error("unable to sync:", err.stack);
      });
      uploader.on('progress', function() {
        console.log("progress", uploader.progressAmount, uploader.progressTotal);
      });
      uploader.on('end', function() {
        console.log("done uploading");
        //uplaod to ipfs
        exec('ipfs add -r build', (err, stdout, stderr) => {
          if (err) {
            // node couldn't execute the command
            return;
          }

          // the *entire* stdout and stderr (buffered)
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);


          console.log("Done. Visit ipfs location https://ipfs.io/ipfs/YOURHASH to get it cached.")
            console.log("You might also want to run 'node invalidate.js' to clear the cloudfront cache.")
        })
      });


  })





});
