public without sharing class FeedbackController {
    
    @AuraEnabled(cacheable=true)
    public static Contact getConRec(String recordId){
        try {
            Contact conRec = [SELECT Id, Name, Phone, Email FROM Contact WHERE Id =: recordId LIMIT 1];
            return conRec;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    @AuraEnabled
    public static String sendMail(String toAddress, String subject, String mailBody, Contact conRec, String recordId, String category){
        
        // System.debug('To address is --> '+toAddress);
        // System.debug('Subject is --> '+subject);
        // System.debug('mail body is --> '+mailBody);
        
        string rawData ='From: desairavi2002@gmail.com\n' +
                        'To: '+ toAddress +'\n'+
                        'Subject: '+ subject +' \n' +
                        'Content-Type: text/html \n\n' + mailBody;
        
        String mailMsg = EncodingUtil.base64Encode(Blob.valueOf(rawData));
        mailMsg = mailMsg.replace('+', '-');
        mailMsg = mailMsg.replace('/', '_');
        
        String reqBody = '{"userId":"me","raw":"'+ mailMsg +'"}';
        
        Http http = new Http();
        HttpRequest httpReq = new HttpRequest();
        
        httpReq.setEndpoint('callout:Gmail_API/gmail/v1/users/me/messages/send');
        httpReq.setMethod('POST');
        httpReq.setHeader('Content-Type', 'application/json');
        httpReq.setBody(reqBody);
        
        HttpResponse httpRes = http.send(httpReq);
        if(httpRes.getStatusCode() == 200){

            Feedback__c newRec = new Feedback__c();
            newRec.Name = conRec.Name;
            newRec.Email_Address__c = conRec.Email;
            newRec.Phone_Number__c = conRec.Phone;
            newRec.Message__c = mailBody;
            newRec.Contact__c = recordId;
            newRec.Category__c = category;
            insert newRec;

            System.debug('Name --> '+newRec.Name);
            System.debug('Email --> '+newRec.Email_Address__c);
            System.debug('Phone --> '+newRec.Phone_Number__c);
            System.debug('message --> '+newRec.Message__c);
            System.debug('Category__c --> '+newRec.Category__c);

            return 'success';
        }else{
            return 'status --> '+httpRes.getBody();
        }
    }
}