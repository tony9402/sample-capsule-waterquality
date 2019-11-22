var console = require("console");
var http = require("http");

/* 
 * 사용한 공공 데이터 API : https://www.data.go.kr/dataset/3079063/openapi.do
 */

//공공 데이터 포털 API Key는 url query encode 되어있습니다.
//아래 API Key: 발급 받은 Key를 decode한 것

const API_KEY_DECODE = "<input your api key>";

function GetCodeList() {
  var baseurl = "http://apis.data.go.kr/B500001/rwis/waterQuality/supplyLgldCode/list?"
  var query = {
    serviceKey: API_KEY_DECODE,
    numOfRows: "500",
    pageNo: "1"
  };
  var url = baseurl + http.makeQueryString(query);

  //사용하는 API는 XML 형식이므로 자동 파싱이 되게 format을 xmljs로 맞춰줍니다.
  var ret = http.getUrl(url, {
    format: 'xmljs'
  });
  var result = [];

  for (let i = 0; i < ret.response.body.items.item.length; i++) {
    var found = false;
    for (let j = 0; found == false && j < result.length; j++) {
      if (result[j].sujCode == ret.response.body.items.item[i].sujCode)
        found = true;
    }
    if (found === false) {
      result.push({
        sujCode: ret.response.body.items.item[i].sujCode,
        fcltyMngNo: ret.response.body.items.item[i].fcltyMngNo
      })
    }
  }
  return result;
}

module.exports.function = function search_Water(water) {
  var CodeList = GetCodeList();
  console.log(CodeList);
  var returnList = [];
  var baseurl = "http://apis.data.go.kr/B500001/rwis/waterQuality/list?";

  for (let i = 0; i < CodeList.length; i++) {
    var query = {
      stDt: "2019-11-22",
      stTm: "03",
      edDt: "2019-11-22",
      edTm: "03",
      sujCode: CodeList[i].sujCode,
      fcltyMngNo: CodeList[i].fcltyMngNo,
      liIndDiv: "1",
      numOfRows: "10",
      pageNo: "1",
      serviceKey: API_KEY_DECODE
    }
    var url = baseurl + http.makeQueryString(query);

    //사용하는 API는 XML 형식이므로 자동 파싱이 되게 format을 xmljs로 맞춰줍니다.
    var ret = http.getUrl(url, {
      format: 'xmljs'
    });

    console.log(ret);
    var Count = ret.response.body.totalCount;
    if (Count == 0) continue;
    if (Count == 1) {
      var value = ret.response.body.items.item.clVal;
      if (value * 1.0 < 1)
        ret.response.body.items.item.clVal = '0' + value;
      value = ret.response.body.items.item.tbVal;
      if (value * 1.0 < 1)
        ret.response.body.items.item.tbVal = '0' + value;
      returnList.push(ret.response.body.items.item);
    } else
      for (let j = 0; j < ret.response.body.totalCount; j++) {
        var value = ret.response.body.items.item[j].clVal;
        if (value * 1.0 < 1)
          ret.response.body.items.item[j].clVal = '0' + value;
        value = ret.response.body.items.item[j].tbVal;
        if (value * 1.0 < 1)
          ret.response.body.items.item[j].tbVal = '0' + value;
        returnList.push(ret.response.body.items.item[j]);
      }
  }
  console.log(returnList);
  return returnList;
}
