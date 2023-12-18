const brevo = require('@getbrevo/brevo');
const { Logger } = require('./logger');

exports.sendEmails = async (data, sender) => {
    const apiInstance = new brevo.TransactionalEmailsApi()
    const apiKey = apiInstance.authentications['apiKey']
    apiKey.apiKey = process.env.BREVO_KEY

    try {
        for(let item of data) {
            const sendSmtpEmail = new brevo.SendSmtpEmail()
            sendSmtpEmail.subject = item.subject
            sendSmtpEmail.htmlContent = item.htmlContent
            sendSmtpEmail.sender = sender
            sendSmtpEmail.to =[{email: item.email, name: item.name}]
            await apiInstance.sendTransacEmail(sendSmtpEmail)
        }
        return true
    } catch (err) {
        Logger.e('utils -> email-sender -> sendEmails', err)
        return false
    }
}