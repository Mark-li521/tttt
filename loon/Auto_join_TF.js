!(async () => {
    ids = $persistentStore.read('APP_ID')
    if (ids == '') {
        $notification.post('所有TF已加入完毕', '模块已自动关闭', '')
        $done($httpAPI('POST', '/v1/modules', {'Auto module for JavaScripts': 'false'}))
    } else {
        ids = ids.split(',')
        for await (const ID of ids) {
            await autoPost(ID)
        }
    }
    $done()
})();

function autoPost(ID) {
    let Key = $persistentStore.read('key')
    let testurl = 'https://testflight.apple.com/v3/accounts/' + Key + '/ru/'
    let request_url = {
        url: testurl + ID,
        // url: 'http://127.0.0.1:8000',
        headers:
            {
                'User-Agent': '',
                'Host': 'testflight.apple.com',
                'X-Session-Id': `${$persistentStore.read('session_id')}`,
                'X-Session-Digest': `${$persistentStore.read('session_digest')}`,
                'X-Request-Id': `${$persistentStore.read('request_id')}`,
            }
    }
    return new Promise(function (resolve) {
        $httpClient.get(request_url, function (error, resp, data) {
            if (error === null) {
                if (resp.status == 404) {
                    ids = $persistentStore.read('APP_ID').split(',')
                    ids = ids.filter(ids => ids !== ID)
                    //$persistentStore.write(ids.toString(), 'APP_ID')
                    console.log(ID + ' ' + '不存在该TF，已自动删除该APP_ID-by跳过')
                    //$notification.post(ID, '不存在该TF', '已自动删除该APP_ID')
                    resolve()
                } else {
                    let jsonData = JSON.parse(data)
                    if (jsonData.data == null) {
                        console.log(ID + ' ' + jsonData.messages[0].message)
                        resolve();
                    } else if (jsonData.data.status == 'FULL') {
                        console.log(ID + ' ' + jsonData.data.message)
                        resolve();
                    } else {
                        let accept_url = {
                            url: testurl + ID + '/accept',
                            headers:
                                {
                                    'User-Agent': '',
                                    'Host': 'testflight.apple.com',
                                    'X-Session-Id': `${$persistentStore.read('session_id')}`,
                                    'X-Session-Digest': `${$persistentStore.read('session_digest')}`,
                                    'X-Request-Id': `${$persistentStore.read('request_id')}`,
                                }
                        }
                        $httpClient.post(accept_url, function (error, resp, body) {
                            console.log(data + ' TestFlight data')
                            let jsonBody = JSON.parse(body)
                            $notification.post(jsonBody.data.name, 'TestFlight加入成功', '')
                            console.log(jsonBody.data.name + ' TestFlight加入成功')
                            ids = $persistentStore.read('APP_ID').split(',')
                            ids = ids.filter(ids => ids !== ID)
                            $persistentStore.write(ids.toString(), 'APP_ID')
                            resolve()
                        });
                    }
                }
            } else {
                if (error == 'The request timed out.') {
                    resolve();
                } else {
                    $notification.post('自动加入TF', error, '')
                    console.log(ID + ' ' + error)
                    resolve();
                }
            }
        })
    })
}