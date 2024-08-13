/* 공용 서버 스크립트 작성 가이드
* 1. 자동완성 스크립트에 정의한 내용을 구현한다.
* mikApvPublic.FileList = [4,5,6]
* mikApvPublic.writeLog = function (param1) {
*     console.log(param1 + 'aa' + mikApvPublic.FileList[0]);
*     return true;
* };
* 2. 반드시 mikApvPublic 안에 포함되도록 mikApvPublic.xxxx 형태로 작성한다.
*/
/*
 * [아모레퍼시픽]
    예시 양식: [아모레]Procurement Approval
    #사용법
    ## 필드 생성 시
    - [추가]버튼은 필드 상단 html에 html을 직접 작성하고 id속성을 부여한다.
    - 결과 테이블은 입력 테이블의 맨 왼쪽에 행 넘버 컬럼을 추가한 테이블로 필드를 생성한다.
    - 데이터를 저장할 히든 필드를 생성한다.
    ## 스크립트 작성 시
    mikApvPublic.aud.fieldId.btnAdd = {추가버튼ID} * 버튼만 ID입력한다.
    mikApvPublic.aud.fieldId.inputTbl= {입력테이블 Alias}
    mikApvPublic.aud.fieldId.renderTbl= {결과테이블 Alias}
    mikApvPublic.aud.fieldId.hfData= {히든 필드 Alias}
    위 변수를 작성 후
    mikApvPublic.aud.proc() 실행 (초기화 스크립트에서 항상 실행되도록 한다.(조회/편집 상관 없이)
 */
    mikApvPublic.aud_data = {
        fieldId: {
            // 추가(수정완료) 버튼
            btnAdd: '',
            // 입력 테이블
            inputTbl: '',
            // 결과 테이블
            renderTbl: '',
            // 정보 저장 테이블
            hfData: ''
        },
        $: {
            // 제이쿼리 객체 설정란
            // validation과정에서 할당
        },
        modifiedIdx: '',
        data: [],
        headTitle: [],
        proc: function() {
            // fieldInitialize()에서 필요한 객체를 체크하므로 가장 먼저 실행되어야 한다.
            this.fieldInitialize()
            // 히든 필드에 데이터가 있다면, 표시한다.
            this.renderData()
            // 모드 설정
            this.setMode()     
        },
        setMode() {
            // 조회 모드
            if (g_approvalLineInfo.isView) {
                // 버튼 숨기기
                this.$.inputTbl.hide()
                this.$.btnAdd.hide()
            }
            // 편집 모드
            else {
                // 헤더 정보 로드 (알림메시지용)
                this.getHeaderText()
                // 버튼 이벤트 설정
                this.setBtn()
            }
        },
        renderData: function() {
            // 저장된 데이터 모두 결과테이블에 렌더링
            this.data.forEach((rowData, idx) => {
                this.createTblRow(rowData, idx)
            })
        },
        setBtn: function() {
            const $btnAdd = this.$.btnAdd
            const $renderTbody = this.$.renderTbl.find('tbody')
            // 추가 버튼 이벤트
            $btnAdd.click(() => {
                this.addRow()
            })
            // 수정완료 버튼 생성
            this.$.btnUpdate = $btnAdd.after(`
                <button 
                    id="btnUpdate"
                    class="btn_type_e btn_color_02" 
                    type="button">
                    <span class="btn_txt">수정완료</span>
                </button>
            `)
            .next()
            .hide()
            // 수정완료 이벤트
            .click(() => {
                // 테이블에 입력된 값을 가져와서
                const rowData = this.getDataFromTbl()
                // rowData 검증
                if (!rowData) {
                    return false
                }
                // 기존 data를 대체한다.
                this.data[this.modifiedIdx] = rowData
                // 변경된 데이터 저장
                this.saveData()
                // 결과 테이블 초기화
                $renderTbody.empty()
                // 결과 테이블 다시 그리기
                this.renderData()
                // 수정완료 숨기고 추가버튼 표시
                this.$.btnAdd.show()
                this.$.btnUpdate.hide()
            })
        },
        getHeaderText: function() {
            // th목록
            const thList = this.$.inputTbl.find('thead > tr th')
            thList.each((idx, th) => {
                this.headTitle.push(th.innerHTML ?? '')
            })
        },
        saveData: function() {
            // 히든 필드에 데이터 저장해서 날아가지 않게 하기
            this.$.hfData.val(JSON.stringify(this.data))
        },
        createTblRow: function(rowData, idx) {
            // 결과 테이블 행html생성
            const htmlArr = []
            htmlArr.push(`<tr class="tbl_row" id="row_${idx + 1}">`)
            htmlArr.push(`  <td class="tbl_data contents-field-td field-align-center">`)
            htmlArr.push(`      <span>${idx + 1}</span>`)
            if (!g_approvalLineInfo.isView) {
                htmlArr.push(`      <input type="button" onclick="mikApvPublic.aud_data.fnModify(event)" value="수정" row="${idx}">`)
                htmlArr.push(`      <input type="button" onclick="mikApvPublic.aud_data.fnDelete(event)" value="삭제" row="${idx}">`)
            }
            htmlArr.push(`  </td>`)
            rowData.forEach((value) => {
                htmlArr.push(this.createTdHtml(value[1]))
            })
            htmlArr.push(`</tr>`)
            // 결과 테이블 하위에 렌더링
            this.$.renderTbl.find('tbody').append(htmlArr.join(''))
        },
        createTdHtml: function(value) {
            // td html 리턴
            return`
            <td class="contents-field-td tbl_data field-align-center">
                <span>${value}</span>
            </td>
            `
        },
        fieldInitialize: function() {
            // 매개변수 검사
            const keys = Object.keys(this.fieldId)
            keys.every((val) => {
                // 필드값이 비었다면, 검증 실패 및 알림.
                const value = this.fieldId[`${val}`]
                if (value.length <= 0) {
                    alert(`fieldId.${val}의 값은 필수입니다.`)
                    return false
                }
                // 필드값이 있다면, 제이쿼리 객체가 있는지 검증
                const $value = $(`#${value}`)
                if ($value.length) {
                    // 제이쿼리 객체가 존재하는 경우 $에 할당한다.
                    this.$[`${val}`] = $value
                } else {
                    // 제이쿼리 객체가 없는 경우 검증 실패
                    alert(`fieldId.${val}의 값이 잘못되었습니다.`)
                    return false
                }
                return true
            })
            // 히든 필드 데이터 렌더링
            const data = this.$.hfData.val()
            if (data) {
                this.data = JSON.parse(data)
                this.renderData()
            }
        },
        getDataFromTbl: function() {
            // input테이블에 입력된 값을 Data에 저장하고 히든 필드에 저장한다.
            const $inputTdList = this.$.inputTbl.find('tbody > tr td') //td목록 가져오기
            const rowData = []
            // td목록에서 값 꺼내어 타입에 따라 배열로 묶음을 만들어 rowData에 푸쉬
            try {   // 빈 값에 대한 검증 로직때문에 try~catch이용
                $inputTdList.each((idx, td) => {
                    const $td = $(td)
                    const $input = $td.find('input')
                    // 만약 input 필드라면 (text, radio)
                    if ($input.length) {
                        switch($input.attr('type')) {
                            // 텍스트 타입
                            case 'text':
                                // 빈 값에 대한 검증 로직
                                if (!$input.val()) {
                                    throw {obj: $input, idx}
                                }
                                rowData.push(['text', $input.val()])
                                break
                            // 라디오 타입
                            case 'radio':
                                const $check = $td.find(':checked')
                                rowData.push(['radio', $check.next().find('span').text() ?? '' , $check.val() ?? ''])
                                break
                        }
                    }
                    // 나머지는 select태그인 경우
                    else {
                        rowData.push(['select', $td.find('option:selected').text() ?? '', $td.find('option:selected').val() ?? ''])
                    }
                })
                // 정상적으로 진행되면, 입력값들 초기화(빈 값 체크 로직 때문에 값을 가져오면서 초기화를 하면, 중간에 빈 값이 생긴 경우 이전 값들이 모두 빈 값이 되는 현상 발생 따라서 정상 진행 시 초기화를 해야함.)
                $inputTdList.each((idx, td) => {
                    const $td = $(td)
                    const $input = $td.find('input')
                    if ($input.length) {
                        switch($input.attr('type')) {
                            case 'text':
                                $input.val('')
                                break
                            case 'radio':
                                $td.find('input:eq(0)').prop('checked', true)
                                break
                        }
                    }
                    else {
                        $td.find('option:eq(0)').prop('selected', true)
                    }
                })
                return rowData
            } catch (e) {
                fn_Cmn_Alert(`${this.headTitle[e.idx]}을 입력해주세요.`, () => {mikApvPublic.highlightByObject(e.obj)})
                return false
            }
            
        },
        addRow: function() {
            const rowData = this.getDataFromTbl()
            // rowData 검증
            if (!rowData) {
                return false
            }
            // data에 푸쉬
            this.data.push(rowData)
            // 히든 필드에 저장
            this.saveData()
            // 테이블에 행 추가
            this.createTblRow(rowData, this.data.length - 1)
        },
        fnModify: function(e) {
            this.modifiedIdx = $(e.target).attr('row')
            // 입력 테이블에 기존 값 세팅하기
            const $inputTdList = this.$.inputTbl.find('tbody > tr td') //td목록 가져오기
            // 데이터에서 해당 행의 값을 하나씩 꺼내서 입력 테이블에 세팅
            this.data[this.modifiedIdx].forEach((colData, idx) => {
                switch(colData[0]) {
                    case 'text':
                        $($inputTdList[idx]).find('input').val(colData[1])
                        break
                    case 'radio':
                        $($inputTdList[idx]).find(`input[value="${colData[2]}"]`).prop('checked', true)
                        break
                    case 'select':
                        $($inputTdList[idx]).find('select').val(colData[2]).prop('selected', true)
                        break
                }
            })
            // 추가버튼 숨기고, 수정완료 버튼 표시
            this.$.btnAdd.hide()
            this.$.btnUpdate.show()
        },
        fnDelete: function(e) {
            const $renderTbody = this.$.renderTbl.find('tbody')
            _.pullAt(this.data, $(e.target).attr('row'))
            this.saveData()
            // 결과 테이블 초기화
            $renderTbody.empty()
            // 결과 테이블 다시 그르기
            this.renderData()
        }
    }