// 사본처 설정
mikApvPublic.getEltByAlias('workplace_select').change(function () {
    if ($(this).val() === 'place_1') {
        //@ts-ignore
        ApvLineHandler.callbackReceiptSelector(ccList_1)
    } else if ($(this).val() === 'place_2') {
        //@ts-ignore
        ApvLineHandler.callbackReceiptSelector(ccList_2)
    } else if ($(this).val() === 'place_3') {
        //@ts-ignore
        ApvLineHandler.callbackReceiptSelector(ccList_3)
    } else {
        //@ts-ignore
        ApvLineHandler.callbackReceiptSelector([])
    }
})

// workplace_select 값에 따른 수신처 세팅
function setCcList(userIdList, ccList) {
    for (let i = 0; i < userIdList.length; i++) {
        let userId = userIdList[i]
        ApvIfHelper.ExecuteByFuncName(
            "select_UserInfo_khs",
            {
                "UserID": userId
            },
            function (resultStr) {
                var result = JSON.parse(resultStr)
                if (result.length > 0 && result[0].ResultStatus == 1) {
                    var data = JSON.parse(result[0].ResultString)
                }

                let userInfo = {
                    ReceiptID: -1,
                    Gubun: '구분',
                    UserName: data.Table[0].Name,
                    UserID: data.Table[0].UserID,
                    UserTitle: data.Table[0].Title,
                    UserDuty: data.Table[0].Duty,
                    UserJob: data.Table[0].Job,
                    UserExtApvTitle: data.Table[0].ExtApvTitle,
                    UserEmailAddress: data.Table[0].EmailAddress,
                    DeptName: data.Table[0].DeptID,
                    DeptID: data.Table[0].DeptID,
                    ReceiptType: '',
                    FixedYN: 'N',
                    SubDeptYN: '',
                    DisplayName: data.Table[0].Name + '/' + data.Table[0].DeptID,
                    SortOrder: "test",
                    DeptEmailAddress: ''
                }

                ccList.push(userInfo)
            },
            function (result) {
                /* 인터페이스 실패에 대한 대응 방법을 각 프로젝트에 맞게 구현하시기 바랍니다.
                * 기본적인 처리 방법은 오류가 발생 시 throw Error(['select_UserInfo_khs', 'ERROR', result[0].FailMessage].join(' '))로 처리
                */
                console.log(result)
            })
    }


}

// 한글 입력 외에 입력방지
function onlyKorean(elt) {
    const korean = /^[ㄱ-ㅎ|가-힣|]+$/
    if (!korean.test(elt.val())) {
        fn_Cmn_Alert('외주용역비 금액 앞부분에는 한글만 입력이 가능합니다.')
        elt.val('')
        return 0
    }
}

// 1000단위 포맷팅 -> toLocaleString 함수 사용하면 되는데 안먹힘
function thousandUnitParse(elt) {
    elt.val(elt.val().split(',').join('').replace(/\B(?=(\d{3})+(?!\d))/g, ","))
}

// 사업자등록번호 포맷팅
function businessRegisterNoFormat(elt, key) {
    let onlyNumberStr = elt.val().split('-').join('')

    if (isNaN(key)) {
        var regex = /^[0-9]*$/
        if (!regex.test(onlyNumberStr)) {
            elt.val(elt.val().substring(0, elt.val().length - 1))
            return 0
        } else {
            return 0
        }
    }
    if (onlyNumberStr.length > 10) {
        console.log('here')
        console.log(onlyNumberStr.substring(0, 10).replace(/(\d{3})(\d{2})(\d)/, "$1-$2-$3"))
        elt.val(onlyNumberStr.substring(0, 10).replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3"))
        return 0
    }

    if (onlyNumberStr.length > 5) {
        elt.val(onlyNumberStr.replace(/(\d{3})(\d{2})(\d)/, "$1-$2-$3"))
    } else if (onlyNumberStr.length > 3) {
        elt.val(onlyNumberStr.replace(/(\d{3})(\d{1,2})/, "$1-$2"))
    }
}

/**
 * ==========================================↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 툴팁 관련 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓==========================================
 * ==========================================↓↓↓↓↓↓↓↓↓↓↓↓↓↓ 툴팁 관련 ↓↓↓↓↓↓↓↓↓↓↓↓↓↓==========================================
 */
// 툴팁 css
$('head').append(`
    <style>
      .container {
        position: relative;
      }
  
      .tooltip {
        display: none;
        position: absolute;
        top: -60%;
        left: 10%;
        padding: 5px;
        background-color: #333;
        color: #fff;
        border-radius: 5px;
        font-size: 12px;
        white-space: nowrap;
      }
    </style>
  `)

// 이후 해당 태그의 상위태그에 container, 해당 태그 밑에 툴팁 div 추가
mikApvPublic.getEltByAlias('area_size').closest('td').addClass('container')
mikApvPublic.getEltByAlias('area_size').closest('td').append(`<div class="tooltip" id="area_size_tooltip" style="display: none;">숫자만 입력 가능합니다</div>`)

// 이후 이벤트 잡아서 show, hide
mikApvPublic.getEltByAlias('area_size').keyup(function (e) {
    let regex = /[^0-9]/g;
    if (regex.test(e.key)) {
        $('#area_size_tooltip').show();
        setTimeout(function () {
            $('#area_size_tooltip').hide();
        }, 1000)
    }
})

/**
 * ==========================================↑↑↑↑↑↑↑↑↑↑↑↑↑↑ 툴팁 관련 ↑↑↑↑↑↑↑↑↑↑↑↑↑↑==========================================
 * ==========================================↑↑↑↑↑↑↑↑↑↑↑↑↑↑ 툴팁 관련 ↑↑↑↑↑↑↑↑↑↑↑↑↑↑==========================================
 */