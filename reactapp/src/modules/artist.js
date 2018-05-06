
export default function(image){
  let chars = image.substring(0,2);
  if(chars=="aw"){
    return "Adam Whitlock"
  }else if(chars=="ad"){
    return "Andrew Desforges"
  }else if(chars=="ag"){
    return "Austin Griffith"
  }else if(chars=="wg"){
    return "wgmeets"
  }else if(chars=="ts"){
    return "thestarflyer"
  }else if(chars=="jb"){
    return "jbdoge"
  }else if(chars=="pz"){
    return "PersonZ"
  }else if(chars=="ce"){
    return "Max Brody"
  }else if(chars=="vp"){
    return "Valerio Poltrini"
  }else if(chars=="al"){
    return "Arya Love"
  }


  return "Unknown"
}
