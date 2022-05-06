class UserController{
    
    constructor(formIdCreate, formIdUpdate, tableId){
        this.formEl = document.getElementById(formIdCreate);
        this.formElUpdate = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.submitClick();
        this.editClick();
        this.selectAll();
    }

    editClick(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener('click', e=>{
            this.showPainelCreate();
        });

        this.formElUpdate.addEventListener('submit', event=>{
            event.preventDefault();

            let btnSubmit = this.formElUpdate.querySelector("[type=submit]");
            btnSubmit.disabled = true;

            let values = this.getValues(this.formElUpdate);

            let index = this.formElUpdate.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values);

            this.getPhoto(this.formElUpdate).then(
                content =>{
                    if(!values.photo){
                        result._photo = userOld._photo;
                    }else{
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save();

                    this.getTr(user, tr);

                    this.updateCount();

                    btnSubmit.disabled = false;

                    this.showPainelCreate();
                }, 
                e =>{
                    console.error(e);
                }
            );

        });
    }

    showPainelCreate(){
        document.getElementById("box-user-create").style.display = "block";
        document.getElementById("box-user-update").style.display = "none";
    }

    showPainelUpdate(){
        document.getElementById("box-user-create").style.display = "none";
        document.getElementById("box-user-update").style.display = "block";
    }

    submitClick(){

        this.formEl.addEventListener("submit", event => {
            event.preventDefault();

            let btnSubmit = this.formEl.querySelector("[type=submit]");
            btnSubmit.disabled = true;

            let values = this.getValues(this.formEl);

            if(!values) return false;
            
            this.getPhoto(this.formEl).then(
                content =>{
                    values.photo = content;

                    values.save();

                    this.addLine(values);

                    this.formEl.reset();

                    btnSubmit.disabled = false;
                }, 
                e =>{
                    console.error(e);
                }
            );

        });

    }

    getPhoto(formEl){
        return new Promise((resolve, reject)=>{
            let fileReader = new FileReader();
        
            let elements = [...formEl.elements].filter(item =>{
                if(item.name === "photo"){
                    return item;
                }
            });
    
            let file = elements[0].files[0];
    
            fileReader.onload = () =>{
    
                resolve(fileReader.result);
    
            };

            fileReader.onerror = ()=>{
                reject(e);
            };
            
            if(file){
                fileReader.readAsDataURL(file);
            }else{
                resolve('dist/img/boxed-bg.jpg');
            }
            
        });

        
    }

    getValues(formEl){

        let user = {};
        let isValid = true;
        //... SERVE PARA CONTAR QUANTOS ElEMENTOS TEM NUM ARRAY SEM PRECISAR COLOCAR A QUANTIDADE DE ELEMENTOS!!!
        [...formEl.elements].forEach((field, index) => {

            if(['name', 'email', 'password'].indexOf(field.name) > -1  && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;

            }

            if(field.name == "gender") {
    
                if(field.checked){
                    user[field.name] = field.value;
                }
                console.log(field);
            }else if(field.name == "admin"){
                user[field.name] = field.checked;
            }else{
                user[field.name] = field.value;
            }
        });
    
        if(isValid){
            return new User(user.name, user.gender, user.birth, user.country, user.email, user.password, user.photo, user.admin);
        }else{
            return false;
        }

    }

    selectAll(){

        let users = User.getUsersStorage();

        users.forEach(dataUser=>{
            let user = new User();

            user.loadFromJSON(dataUser);

            this.addLine(user);
        });
    }

    addLine(dataUser){

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount();


    }

    getTr(dataUser, tr = null){
        if(tr == null) tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Nao'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTR(tr);

        return tr;
    }

    addEventsTR(tr){
        tr.querySelector(".btn-delete").addEventListener('click', e=>{

            if(confirm("Deseja realmente excluir?")){
                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateCount();    
            }

        });

        tr.querySelector(".btn-edit").addEventListener('click', e=>{
            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector("#form-user-update");

            form.dataset.trIndex = tr.sectionRowIndex;

            let formUpdate = this.formElUpdate;

            for(let name in json){
                let field = formUpdate.querySelector("[name="+name.replace("_", "")+"]");
                
                if(field){

                    switch(field.type){
                        case 'file':
                            continue;
                        break;

                        case 'radio':
                            field = formUpdate.querySelector("[name="+name.replace("_", "")+"][value="+json[name]+"]");
                            field.checked = true;
                        break;

                        case 'checkbox':
                            field.checked = json[name];
                        break;

                        default:
                            field.value = json[name];
                    }

                }
            }

            formUpdate.querySelector(".photo").src = json._photo;

            this.showPainelUpdate();
        });
    }

    updateCount(){

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr=>{
            numberUsers++;

            let user = JSON.parse(tr.dataset.user);

            if(user._admin) numberAdmin++;
        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;

    }
}