// const client = {
//     posts: [
//         { 
//             id: 2398432,
//             post: 'This is my first post! 😊', 
//             start: '2021-07-01 12:00:00',
//             repeat: 24,
//             amount: 5,
//             groups: [392847324, 239847239, 239847239],
//             fulfilled: [2387468237, 2387468237, 2387468237, 2387468237, 2387468237],
//         },
//     ],
//     groups: [
//         {
//             id: 392847324,
//             groupId: 1943857349578934,
//             groupName: 'שותפים לסטארט אפ', 
//         },
//         {
//             id: 239847239,
//             groupId: 1943857349578934,
//             groupName: 'שותפים לסטארט אפ',
//         },
//         {
//             id: 239847239,
//             groupId: 1943857349578934,
//             groupName: 'שותפים לסטארט אפ',
//         }
//     ]
// }


// // Set post - Post requiest:
// {
//     post: 'This is my first post! 😊', 
//     start: '2021-07-01 12:00:00',
//     repeat: 24,
//     amount: 5,
//     groups: [392847324, 239847239, 239847239],
//     fulfilled: null,
// }



// // Get posts - Post request:
// {
//     param : value
// }


// return: 
//  [
//         { 
//             id: 2398432,
//             post: 'This is my first post! 😊',
//             start: '2021-07-01 12:00:00',
//             repeat: 24,
//             amount: 5,
//             groups: [ 
//             {
//                 id: 392847324,
//                 groupId: 1943857349578934,
//                 groupName: 'שותפים לסטארט אפ', 
//             }, 
//             {
//                 id: 239847239,
//                 groupId: 1943857349578934,
//                 groupName: 'שותפים לסטארט אפ',
//             }
//         ],
//             fulfilled: [2387468237, 2387468237],
//         },
// ]


// // Get groups - Get request:

// return :
// [ 
//     {
//         id: 392847324,
//         groupId: 1943857349578934,
//         groupName: 'שותפים לסטארט אפ', 
//     },
//     {
//         id: 239847239,
//         groupId: 1943857349578934,
//         groupName: 'שותפים לסטארט אפ',
//     },
//     {
//         id: 239847239,
//         groupId: 1943857349578934,
//         groupName: 'שותפים לסטארט אפ',
//     }
// ]


// // SetFulfilled - Post request:
// {
//     postId: 2398432,
//     groupId: 392847324
// }