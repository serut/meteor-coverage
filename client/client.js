$.ajax({
    method: 'POST',
    url: '/coverage/client',
    data: JSON.stringify(__coverage__),
    content: 'application/json; charset=UTF-8',
    processData: false,
    success: function() {
        console.log('success');
    },
    error: function() {
        console.log('failed')
    }
})
