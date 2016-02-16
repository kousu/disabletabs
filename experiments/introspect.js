function introspect(o) {
        console.log("properties of " + o + ":");
        for(p in o) {
                console.log(o + "." + p + " = " + o[p]);
        }
        console.log("/properties of " + o);
}

exports.introspect = introspect;
