import { LightningElement, api, wire, track } from 'lwc';
import sendMail from '@salesforce/apex/FeedbackController.sendMail';
import getRecData from '@salesforce/apex/FeedbackController.getConRec';

import { ShowToastEvent } from "lightning/platformShowToastEvent";
import {CloseActionScreenEvent} from 'lightning/actions';

export default class FeedbackForm extends LightningElement {
    @api recordId;
    @track isLoading = false;

    @track isDisable = false;

    @api conName;
    @api conEmail;
    @api conPhone;
    @track msg;
    @track category;

    @track options = [
        {label: "Product", value: "Product"},
        {label: "Service", value: "Service"},
        {label: "Website", value: "Website"}
    ]
    @track selectedOption;

    demoFun(){
        console.log("Record id --> "+this.recordId);
    }

    @wire(getRecData, { recordId: "$recordId"})
    contacts({ error, data }) {
        if (data) {
            
            this.conName = data.Name;
            this.conEmail = data.Email;
            this.conPhone = data.Phone;
            
            console.log("Data is --> "+JSON.stringify(data));
            console.log("Data is --> "+data.Name);
    
        }else if(error){
            console.log("Error occure while fetching mail id....");
            console.log(error);
        }
    }

    handleInputChange(e){
        let target = e.target;
        if(target.name == 'name'){
            this.conName = target.value;
        }else if(target.name == 'email'){
            this.conEmail = target.value;
        }else if(target.name == 'phoneNum'){
            this.conPhone = target.value;
        }else if(target.name == 'category'){
            this.category = target.value;
        }else if(target.name == 'msg'){
            this.msg = target.value;
        }

    }

    mailSend(){
        this.isLoading = true;
        let conRec = {
            Name: this.conName,
            Email: this.conEmail,
            Phone: this.conPhone
        }
        sendMail({toAddress: this.conEmail, subject: 'Feedback message', mailBody: this.msg, conRec: conRec, recordId: this.recordId, category: this.category})
            .then((res) => {
                console.log("Result are --> "+res);
                const evt = new ShowToastEvent({
                    title: "Mail Sent",
                    message: "Mail sent successfully!!",
                    variant: "success",
                });
                this.dispatchEvent(evt);
                this.isDisable = true;
            })
            .catch((err) => {  
                console.log("Error occurred....");
                console.log(err);
                const evt = new ShowToastEvent({
                    title: "Something went wrong",
                    message: "Mail not sent!",
                    variant: "error",
                });
                this.dispatchEvent(evt);
                this.isDisable = false;
            })
            .finally(() => {
                this.isLoading = false;
                this.dispatchEvent(new CloseActionScreenEvent());
            });
    }
}