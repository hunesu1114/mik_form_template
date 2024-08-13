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

// [선택]에서 display 라벨에 &nbsp;가 포함되어 isView에 그대로 표시 되는 경우 없애는 메서드
let selectedLabelCnt = $('.choicefield-viewmode-label').length
for (let i = 0; i < selectedLabelCnt; i++) {
    $('.choicefield-viewmode-label').eq(i).text($('.choicefield-viewmode-label').eq(i).text().replace(/&nbsp;/g, ''))
}

// 필드편집 -> 부서 에서 width설정시 input과 button 모두 입력해주어야 함 (ex:200;50)
// ContentsRenderHelper.cs -> 2655 Line확인

// 동적테이블 literal + datepicker처리
function addBtnClick() {
    let unique = (new Date()).getTime()
    let html = `<div class="tbl_horiz"><table class="field-table none-editor-table " id="table-el-${unique}"><colgroup><col style="width:5%"><col style="width:10%"><col style="width:8%"><col style="width:6%"><col style="width:22%"><col style="width:9%"><col style="width:10%"><col style="width:15%"><col style="width:5%"></colgroup><tbody><tr class="tbl_row"><th class="tbl_head td-header td-header-first el-714-display-group">번호</th>
<th class="tbl_head td-header el-71-display-group field-align-center ">근무자</th>
<th class="tbl_head td-header el-72-display-group field-align-center ">타입</th>
<th class="tbl_head td-header el-73-display-group field-align-center " colspan="2">근무 시작/종료</th>
<th class="tbl_head td-header el-74-display-group field-align-center " colspan="2">근무 시간</th>
<th class="tbl_head td-header el-75-display-group field-align-center ">사유</th>
<th class="tbl_head td-header el-717-display-group">check</th>


</tr><tr class="tbl_row  "><td class="tbl_data contents-field-td el-718-display-group" rowspan="2"><input type="hidden" id="" value="" data-alias="idx"><div><span class="added-idx" id="idx-${unique}">${++rowCnt}</span></div></td>

<td class="tbl_data contents-field-td el-76-display-group " rowspan="2" id="person-${unique}"></td>

<td class="tbl_data contents-field-td el-77-display-group field-align-center  " rowspan="2"><select id="type_select-${unique}">
      <option value="평일">평일</option>
      <option value="주말">주말</option>
    </select></td>

<th class="tbl_head td-header el-${unique}-display-group has-datepicker-group-td">시작일</th>
    <td class="tbl_data contents-field-td el-${unique}-display-group has-datepicker-group-td ">
    <input type="text" id="start_date-${unique}" value="" class="datetime-date fieldEmptyWidthStyle" data-alias=""><button onclick="$('#start_date-${unique}').datepicker('show'); return false;" class="btn_date"><span class="ico_btn ico_btn_date"></span></button>
    <input type="text" id="start_time-${unique}" value="" class="datetime-time fieldEmptyWidthStyle" data-alias="" autocomplete="OFF"></td>
    
<th class="tbl_head td-header el-79-display-group">총 근무시간</th><td class="tbl_data contents-field-td el-79-display-group "><input type="text" id="total_duration-${unique}" value="" class="text " style="width:80px" data-alias=""></td>
    
<td class="tbl_data contents-field-td el-710-display-group " rowspan="2"><textarea id="reason-${unique}" rows="4" class="" data-alias=""></textarea></td>

<td class="tbl_data contents-field-td el-719-display-group field-align-center  " rowspan="2"><input type="checkbox" id="check-${unique}" class="bor0 delete_check"><label for="check-${unique}"></td>

<tr class="tbl_row  "><th class="tbl_head td-header el-711-display-group has-datepicker-group-td">종료일</th>
    <td class="tbl_data contents-field-td el-711-display-group has-datepicker-group-td" colspan="1">
    <input type="text" id="end_date-${unique}" value="" class="datetime-date fieldEmptyWidthStyle" data-alias=""><button onclick="$('#end_date-${unique}').datepicker('show'); return false;" class="btn_date"><span class="ico_btn ico_btn_date"></span></button>
    <input type="text" id="end_time-${unique}" value="" class="datetime-time fieldEmptyWidthStyle" data-alias="" autocomplete="OFF"></td>

<th class="tbl_head td-header el-712-display-group">야간근무시간</th><td class="tbl_data contents-field-td el-712-display-group " colspan="1">
    <input type="text" id="night_duration-${unique}" value="" class="text " style="width:80px" data-alias=""></td></tr></tbody></table></div>`

    $('#write-container').append(html)

    $('#start_date-' + unique).datepicker({});
    $('#end_date-' + unique).datepicker({});

    $('#start_date-' + unique).change(function () { calculateTime('start_date-' + unique, 'start_time-' + unique, 'end_date-' + unique, 'end_time-' + unique, 'total_duration-' + unique, 'night_duration-' + unique) })
    $('#start_time-' + unique).change(function () { calculateTime('start_date-' + unique, 'start_time-' + unique, 'end_date-' + unique, 'end_time-' + unique, 'total_duration-' + unique, 'night_duration-' + unique) })
    $('#end_date-' + unique).change(function () { calculateTime('start_date-' + unique, 'start_time-' + unique, 'end_date-' + unique, 'end_time-' + unique, 'total_duration-' + unique, 'night_duration-' + unique) })
    $('#end_time-' + unique).change(function () { calculateTime('start_date-' + unique, 'start_time-' + unique, 'end_date-' + unique, 'end_time-' + unique, 'total_duration-' + unique, 'night_duration-' + unique) })

    $('#person-' + unique).append(`<span>${g_approvalLineInfo.apvLineUserContainerList[0].drafter.lineUserName}</span>`)
}

// 정적화면 스크립트 쿼리파라미터 이용
$('head').append(`
  <style>
    .hover:hover {
      cursor:pointer;
      background-color:#E8E8E8
    }
  </style>
`)

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
console.log(urlParams.get('idx'))
let center_list = [
    ['BG99999', '브랜드그룹FC'],
    ['F10002', '프리미엄브랜드 Unit_폐쇄'],
    ['F10003', '데일리뷰티'],
    ['F10012', 'SCM unit'],
    ['F10014', '럭셔리브랜드 Unit_폐쇄'],
    ['F10015', '디지털전략Unit'],
    ['F10016', 'SCM 대표이사실'],
    ['F10090', '넥스트 뷰티 Div'],
    ['F10101', '전략예산 펀드센터'],
    ['F12000', '사장실'],
]

for (let i = 0; i < center_list.length; i++) {
    let html = `
  <tr id="fund_center_elt_${i}" class="hover" style="border-top:1px solid #E8E8E8;border-bottom:1px solid #E8E8E8;line-height: 2rem;">
          <td>${center_list[i][0]}</td>
          <td>${center_list[i][1]}</td>
        </tr>
  `
    $('#fund_center_list_tbody').append(html)
    $('#fund_center_elt_' + i).click(function () {
        window.parent.selectFund(urlParams.get('idx'), center_list[i][0], center_list[i][1])
        MikPopupCommon.closeSelfPopup()
    })
}


$('#search_input').keyup(function () {
    for (let i = 0; i < center_list.length; i++) {
        if (center_list[i][0].includes($(this).val()) || center_list[i][1].includes($(this).val())) {
            $('#fund_center_elt_' + i).show()
        } else {
            $('#fund_center_elt_' + i).hide()
        }
    }
})

// 첨부파일 validation (서버스크립트)
if (!isTempSave) {
    let isReport = $('input:radio[name="' + mikApvPublic.getEltIdByAlias('execution_report') + '"]').val() === 'Y' ? true : false
    if (isReport) {
        if ($('#attachList').children('dt').length === 0) {
            fn_Cmn_Alert('첨부파일은 필수 입니다.')
            return 0
        }
    }
}

/**
 * 첨부파일 2개 첨부 되어있는 상황에서 삭제하는 이벤트를 잡아 체크박스를 해제할때 쓴 로직
 */

// MutationObserver 콜백 함수 정의
function observerCallback(mutationsList) {
  for (let mutation of mutationsList) {
    if (mutation.type === 'childList') {
      mutation.removedNodes.forEach(function (node) {
        if (node.tagName === 'DT') {
          if ($('#attachList').children('dt').length < 2) {
            $('#attach_check').prop("checked", false);
          }
        }
      });
    }
  }
};

// MutationObserver 인스턴스 생성
let observer = new MutationObserver(observerCallback);

// 관찰할 대상 및 옵션 설정
// jQuery 객체는 표준 DOM 요소와는 다릅니다. MutationObserver는 표준 DOM 요소를 요구하기 때문에 jQuery 객체를 직접 사용할 수 없습니다. MutationObserver는 jQuery 메서드가 아니라 표준 DOM API를 통해 동작하기 때문입니다.
observer.observe(document.getElementById('attachList'), { childList: true });
/**
 * ==============================================================================================================================================
 */