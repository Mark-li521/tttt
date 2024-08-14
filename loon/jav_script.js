!(async () => {
    let headers = $request.headers
    let currentValue = "?authorization=" + headers['Proxy-Authorization'] + "&jdsignature=" + headers['jdsignature'];
    let previousValue = $persistentStore.read(['jav_login']);
    if (previousValue == currentValue) {
        $notification.post('无需修改', '')
    } else {
        // 值发生变化，写入新值
        await $persistentStore.write(['jav_login'], currentValue);
        previousValue = currentValue;
        // 调用接口
        await callApi();
    }
    $done()
})();

async function callApi() {
    try {
        let previousValue = await $persistentStore.read(['jav_login']);
        const response = await fetch('https://vod.markc.top:58588/get_login' + previousValue, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('API response:', data);
    } catch (error) {
        console.error('Error calling API:', error);
    }
}