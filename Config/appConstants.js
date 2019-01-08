/**
 * Created by Navit
 */

'use strict';

var SERVER = {
    APP_NAME: 'boilerplate-deakin',
    PORTS: {
        //HAPI: 8000,
        HAPI: 8001,
        SOCKET: 8005

    },
    REDIS_HOST: "127.0.0.1",
    REDIS_PORT: 6379,
    TOKEN_EXPIRATION_IN_MINUTES: 600,
    JWT_SECRET_KEY: 'sUPerSeCuREKeY&^$^&$^%$^%7782348723t4872t34Ends',
    COUNTRY_CODE: '+61',
    THUMB_WIDTH: 50,
    THUMB_HEIGHT: 50,
    DOMAIN_NAME: 'http://localhost:8000/',
    CLOUDANT_DBNAME: ["user", "transactions", "crops", "croprequests"]
};

var SOCIAL = {
    FACEBOOK: "FACEBOOK"
};
var swaggerDefaultResponseMessages = [
    { code: 200, message: 'OK' },
    { code: 400, message: 'Bad Request' },
    { code: 401, message: 'Unauthorized' },
    { code: 404, message: 'Data Not Found' },
    { code: 500, message: 'Internal Server Error' }
];
var DATABASE = {
    USER_ROLES: {
        FARMER: "FARMER",
        EXPORTER: "EXPORTER",
        IMPORTER: "IMPORTER",
        CONSUMER: "CONSUMER"
    },
    TRANSACTION_TYPE: {
        CREATE_ITEMS: "CREATE_ITEMS",
        ORDER_ITEMS: "ORDER_ITEMS",
        SUPPLY_ITEMS: "SUPPLY_ITEMS",
        BUY_ITEMS: "BUY_ITEMS"
    },
    ORDER_STATE: {
        ORDER_REQUESTED: "ORDER_REQUESTED",
        PARTIALLY_COMPLETED: "PARTIALLY_COMPLETED",
        ORDER_COMPLETED: "ORDER_COMPLETED"
    },
    BID_STATUS: {
        PENDING: "PENDING",
        APPROVED: "APPROVED",
        REJECTED: "REJECTED"
    },
    BID_VIEW: {
        PUBLIC: "PUBLIC",
        PRIVATE: "PRIVATE"
    }
};

var STATUS_MSG = {
    ERROR: {
        DEFAULT: {
            statusCode: 400,
            customMessage: 'Error',
            type: 'DEFAULT'
        },
        USER_ALREADY_REGISTERED: {
            statusCode: 409,
            customMessage: 'You are already registered with us',
            type: 'USER_ALREADY_REGISTERED'
        },
        FACEBOOK_ID_PASSWORD_ERROR: {
            statusCode: 400,
            customMessage: 'Only one field should be filled at a time, either facebookId or password',
            type: 'FACEBOOK_ID_PASSWORD_ERROR'
        },
        PASSWORD_REQUIRED: {
            statusCode: 400,
            customMessage: 'Password is required',
            type: 'PASSWORD_REQUIRED'
        },
        INVALID_COUNTRY_CODE: {
            statusCode: 400,
            customMessage: 'Invalid Country Code, Should be in the format +52',
            type: 'INVALID_COUNTRY_CODE'
        },
        INVALID_PHONE_NO_FORMAT: {
            statusCode: 400,
            customMessage: 'Phone no. cannot start with 0',
            type: 'INVALID_PHONE_NO_FORMAT'
        },
        IMP_ERROR: {
            statusCode: 500,
            customMessage: 'Implementation Error',
            type: 'IMP_ERROR'
        },
        UNIQUE_CODE_LIMIT_REACHED: {
            statusCode: 400,
            customMessage: 'Cannot Generate Unique Code, All combinations are used',
            type: 'UNIQUE_CODE_LIMIT_REACHED'
        },
        PHONE_NO_EXIST: {
            statusCode: 400,
            customMessage: 'Mobile No. Already Exist',
            type: 'PHONE_NO_EXIST'
        },
        USERNAME_EXIST: {
            statusCode: 400,
            customMessage: 'Username Already Exist',
            type: 'USERNAME_EXIST'
        },
        INVALID_TOKEN: {
            statusCode: 401,
            customMessage: 'Invalid token provided',
            type: 'INVALID_TOKEN'
        },
        INCORRECT_ACCESSTOKEN: {
            statusCode: 403,
            customMessage: 'Incorrect AccessToken',
            type: 'INCORRECT_ACCESSTOKEN'
        },
        INVALID_CODE: {
            statusCode: 400,
            customMessage: 'Invalid Verification Code',
            type: 'INVALID_CODE'
        },
        USER_NOT_FOUND: {
            statusCode: 400,
            customMessage: 'User Not Found',
            type: 'USER_NOT_FOUND'
        },
        INCORRECT_PASSWORD: {
            statusCode: 400,
            customMessage: 'Incorrect Password',
            type: 'INCORRECT_PASSWORD'
        },
        NOT_REGISTERED: {
            statusCode: 400,
            customMessage: 'You are not registered with YapApp. Kindly register yourself to avail services!',
            type: 'NOT_REGISTERED'
        },
        FACEBOOK_ID_NOT_FOUND: {
            statusCode: 400,
            customMessage: 'Facebook Id Not Found',
            type: 'FACEBOOK_ID_NOT_FOUND'
        },
        PHONE_VERIFICATION_COMPLETE: {
            statusCode: 400,
            customMessage: 'Your mobile number verification is already completed.',
            type: 'PHONE_VERIFICATION_COMPLETE'
        },
        OTP_CODE_NOT_FOUND: {
            statusCode: 400,
            customMessage: 'Otp code not found for this user',
            type: 'OTP_CODE_NOT_FOUND'
        },
        NOT_FOUND: {
            statusCode: 400,
            customMessage: 'User Not Found',
            type: 'NOT_FOUND'
        },
        WRONG_PASSWORD: {
            statusCode: 400,
            customMessage: 'Invalid old password',
            type: 'WRONG_PASSWORD'
        },
        NOT_UPDATE: {
            statusCode: 409,
            customMessage: 'New password must be different from old password',
            type: 'NOT_UPDATE'
        },
        PASSWORD_CHANGE_REQUEST_INVALID: {
            statusCode: 400,
            type: 'PASSWORD_CHANGE_REQUEST_INVALID',
            customMessage: 'Invalid password change request.'
        },
        USER_NOT_REGISTERED: {
            statusCode: 401,
            customMessage: 'User is not registered with us',
            type: 'USER_NOT_REGISTERED'
        },
        PHONE_VERIFICATION: {
            statusCode: 400,
            customMessage: 'Your mobile number verification is incomplete.',
            type: ' PHONE_VERIFICATION'
        },
        INCORRECT_ID: {
            statusCode: 401,
            customMessage: 'Incorrect Phone Number',
            type: 'INCORRECT_ID'
        },
        NOT_VERFIFIED: {
            statusCode: 401,
            customMessage: 'User Not Verified',
            type: 'NOT_VERFIFIED'
        },
        PASSWORD_CHANGE_REQUEST_EXPIRE: {
            statusCode: 400,
            customMessage: ' Password change request time expired',
            type: 'PASSWORD_CHANGE_REQUEST_EXPIRE'
        },
        INVALID_EMAIL_FORMAT: {
            statusCode: 400,
            customMessage: 'Inavlid email format',
            type: 'INVALID_EMAIL_FORMAT'
        },
        ITEM_NAME_ERROR: {
            statusCode: 400,
            customMessage: 'Item name should not contain spaces or special characters',
            type: 'ITEM_NAME_ERROR'
        },
        ROLE_NOT_CORRECT: {
            statusCode: 400,
            customMessage: 'Your role doesnt has permissions for this transaction',
            type: 'ROLE_NOT_CORRECT'
        },
        REQUEST_NOT_EXIST: {
            statusCode: 400,
            customMessage: 'The current request does not exist',
            type: 'REQUEST_NOT_EXIST'
        },
        INSUFFICENT_CROPS: {
            statusCode: 400,
            customMessage: 'No crops available to buy',
            type: 'INSUFFICENT_CROPS'
        },
        CROP_NUMBER_ERROR: {
            statusCode: 400,
            customMessage: 'You dont have enough crops to supply.',
            type: 'CROP_NUMBER_ERROR'
        },
        ORDER_ALREADY_SUPPLIED: {
            statusCode: 400,
            customMessage: 'The order has already been supplied by some one else.',
            type: 'ORDER_ALREADY_SUPPLIED'
        },
        NO_TRANSACTION: {
            statusCode: 400,
            customMessage: 'No transactions found for this item',
            type: 'NO_TRANSACTION'
        },
        BID_ALREADY_EXIST: {
            statusCode: 400,
            customMessage: 'You have already submitted a bid for this request.',
            type: 'BID_ALREADY_EXIST'
        }
    },
    SUCCESS: {
        DEFAULT: {
            statusCode: 200,
            customMessage: 'Success',
            type: 'DEFAULT'
        },
        CREATED: {
            statusCode: 201,
            customMessage: 'Created Successfully',
            type: 'CREATED'
        },
        VERIFY_COMPLETE: {
            statusCode: 200,
            customMessage: 'OTP verification is completed.',
            type: 'VERIFY_SENT'
        },
        VERIFY_SENT: {
            statusCode: 200,
            customMessage: 'Your new OTP has been sent to your phone',
            type: 'VERIFY_SENT'
        },
        LOGOUT: {
            statusCode: 200,
            customMessage: 'Logged Out Successfully',
            type: 'LOGOUT'
        },
        PASSWORD_RESET: {
            statusCode: 200,
            customMessage: 'Password Reset Successfully',
            type: 'PASSWORD_RESET'
        },
        ITEM_SUCCESSFULLY_CREATED: {
            statusCode: 200,
            customMessage: 'Your items were successfully created',
            type: 'ITEM_SUCCESSFULLY_CREATED'
        },
        ITEM_REQUEST_CREATED: {
            statusCode: 200,
            customMessage: 'Your item request was successfully created',
            type: 'ITEM_REQUEST_CREATED'
        },
        ITEM_REQUEST_SUPPLIED: {
            statusCode: 200,
            customMessage: 'Your item request was successfully supplied',
            type: 'ITEM_REQUEST_SUPPLIED'
        },

    }
};

var notificationMessages = {

};

var TIME_UNITS = {
    MONTHS: 'months',
    HOURS: 'hours',
    MINUTES: 'minutes',
    SECONDS: 'seconds',
    WEEKS: 'weeks',
    DAYS: 'days'
};

var APP_CONSTANTS = {
    SERVER: SERVER,
    SOCIAL: SOCIAL,
    TIME_UNITS: TIME_UNITS,
    DATABASE: DATABASE,
    swaggerDefaultResponseMessages: swaggerDefaultResponseMessages,
    STATUS_MSG: STATUS_MSG,
    notificationMessages: notificationMessages
};

module.exports = APP_CONSTANTS;