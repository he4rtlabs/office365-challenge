const msalConfig = {
    auth: {
      clientId: '2083f177-084a-4695-a716-c38eb97c2f32',
      redirectUri: 'http://localhost:3000/'
    },
    scopes: [
      "user.read",
      'mailboxsettings.read',
      'calendars.readwrite'
    ]
};

export default msalConfig;