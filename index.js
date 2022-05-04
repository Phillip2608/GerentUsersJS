var nome = document.querySelector("#exampleInputName");
var gender = document.querySelectorAll("#form-user-create [name=gender]:checked");
var birth = document.querySelector("#exampleInputBirth");
var country = document.querySelector("#exampleInputCountry");
var email = document.querySelector("#exampleInputEmail");
var pass = document.querySelector("#exampleInputPassword");
var file = document.querySelector("#exampleInputFile");
var admin = document.querySelector("#exampleInputAdmin");

var fields = document.querySelectorAll("#form-user-create [name]");

fields.forEach(function(field, index){

    if(field.name == "gender" && field.checked) {
        console.log("SIM", field);
    }else{
        console.log("NAO", field);
    }
});