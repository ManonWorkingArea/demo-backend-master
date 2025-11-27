<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Breadcrumbs from '@/interface/template/outline/Breadcrumbs.vue';
import storageManager from '@/plugins/storage';
export default {
    inject: ['apiServer'],
    data() {
      return {
        accessToken: storageManager.get('session','token'),
        listItems: [],
        dataItem: this.$route.params.id,
        configs: storageManager.get('configs'),
        loading_sources: true,
        tableColumns: [],
        loading:false,
      }
    },
    components: {
      Loader,
      Breadcrumbs
    },
    methods: {
      async fetchData() {
        const query = `

        SELECT 
          CASE s.student_prefix
            WHEN 'mr' THEN 'นาย'
            WHEN 'mrs' THEN 'นาง'
            WHEN 'miss' THEN 'นางสาว'
            ELSE ''
          END AS prefix,
          s.student_firstname AS ชื่อ,
          s.student_lastname AS นามสกล,
          s.student_id AS sid,
          CONCAT(DATE_FORMAT(sc.stu_cert_adddate, '%d'), ' ', 
                CASE MONTH(sc.stu_cert_adddate)
                  WHEN 1 THEN 'ม.ค.'
                  WHEN 2 THEN 'ก.พ.'
                  WHEN 3 THEN 'มี.ค.'
                  WHEN 4 THEN 'เม.ย.'
                  WHEN 5 THEN 'พ.ค.'
                  WHEN 6 THEN 'มิ.ย.'
                  WHEN 7 THEN 'ก.ค.'
                  WHEN 8 THEN 'ส.ค.'
                  WHEN 9 THEN 'ก.ย.'
                  WHEN 10 THEN 'ต.ค.'
                  WHEN 11 THEN 'พ.ย.'
                  ELSE 'ธ.ค.'
                END, ' พ.ศ. ', YEAR(sc.stu_cert_adddate) + 543) AS วันออกใบรับรอง,
          CONCAT(DATE_FORMAT(sc.stu_cert_expiredate, '%d'), ' ', 
                CASE MONTH(sc.stu_cert_expiredate)
                  WHEN 1 THEN 'ม.ค.'
                  WHEN 2 THEN 'ก.พ.'
                  WHEN 3 THEN 'มี.ค.'
                  WHEN 4 THEN 'เม.ย.'
                  WHEN 5 THEN 'พ.ค.'
                  WHEN 6 THEN 'มิ.ย.'
                  WHEN 7 THEN 'ก.ค.'
                  WHEN 8 THEN 'ส.ค.'
                  WHEN 9 THEN 'ก.ย.'
                  WHEN 10 THEN 'ต.ค.'
                  WHEN 11 THEN 'พ.ย.'
                  ELSE 'ธ.ค.'
                END, ' พ.ศ. ', YEAR(sc.stu_cert_expiredate) + 543) AS วันหมดอายุ,
          s.student_token AS รหัสใบรับรอง,
          s.student_citizen_id AS เลขประจำตัวประชาชน,
          sm.order_delivery_phone AS โทร,
          sm.order_delivery_address AS ที่อยู่,
          sm.order_delivery_province_name AS จังหวัด,
          sm.order_delivery_zipcode AS รหัสไปรษณีย์,
          'ผู้ควบคุมการขายวัตถุอันตรายทางการเกษตร' AS หลักสูตร,
          CONCAT('66/01/', sc.stu_cert_id) AS หมายเลขใบรับรอง,
          CONCAT('', s.student_avatar) AS รูปประจำตัว,
          CONCAT('https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://doa.fti.or.th/certification-force.html?token=', s.student_token, '%26session=', sc.lesson_id) AS คิวอาร์โค๊ด
        FROM FTIACADEMY.student s
        LEFT JOIN FTIACADEMY.student_certification sc ON s.student_id = sc.student_id
        RIGHT JOIN FTIACADEMY.marketplace sm ON sm.student_id = sc.student_id AND sm.lesson_id='220'
        WHERE s.student_token IN ('xglvXrBqgqvp0gpxBDeY','VNDvGz3djJKPodrlIegQ','VXJlI3fHQX0yFzcAMXOC','f7sVnKN7tGlBozM0jJKO','eQQcfGb7dWtHd29VhrNB','Qb8FHDDBlE6SdStkN8c4','FZlelyTfLbsqEXqPEmeW','zYQOGpAyEb2RMfIyMFi7','epcyKhVmiuPz36PUzf13','xhW31u6UlYdvFJjDu0KM','CXbAVphs6W2V28s6kV6s','AKBXUKH1GhZtnj5ErEEE','bOojEl73aehBfWNlNk3a','24DulKcmdhVJ4jzcVemy','LNwe2xJlQYkce2THq431','UxnOVrkDlcTtgqLmdmjx','AtpJO0KTm8OkLl0jTOWD','3BDlA8WzHYr3OSZlBQ4v','t0H1BOBOfYA2j2PvLiF6','TEHKLb1fcs6NT3M5aBpA','TaRHhJ6gfDQoVx3mR1cQ','i4HEKZYQJiJo3qxAqQ1f','yqtXPmZuxjtSiF6HLfRw','dCpXGgrgsDgCzkELQAyI','y8U2B4Z5XXjcFDbvuAWN','NjTflF3HQrl6DTYgOAjc','uoIAErhgsCo1At5cxEYY','k1KImipXpArGGQ2zfnup','BVtmrUFkdZXRoXzK0fSI','zO8KbioDv5t06Hwih4jo','PNZshgeqelF5U0R7P6AL','kEsxXzgs241DRI7a2j9n','FqMPk98Rfagn82P1i2q5','1he5kYDvCL5kt7G3ArWs','CbonJZVjhrh9tcq83Lyk','JnmhyUqEVPYtpeg8Q8Oz','dCs5xYIQ5K4La5DSNQRf','vlKOVMRLo12EyLH201d9','C0c4GrTRKXSLOQEyYxAK','CQ6QCFjgeL9egED3sUzB','htJCAzP06qpOED4usN4i','OTMsFbsCyyrKxFjZvZrx','YJFHr2c8lpR6hOr8Wrig','ILxuv3I2YWdvVRx6jm9c','kfMU1LLR2Gyt3cnw4gQD','YyX2RbHahM8zIGB9h3LY','Ek87Dh8PIKDb5vCGHo6N','FWPy36O53f4KQ8E9qeTM','lmUGjtqgpGRaIKlQWO0G','H0xRYcZtIsVRmh0Wars0','Qqg8anzvfSwtbRSTD9xh','MOe2nZOSeQ9dVgRG7Bm3','iUYRm1fUcbByNsLKEJXW','FCIOv5FzrbYbgztHTEWJ','xBJQQLeAF2iZtbzqVVLM','T9bwCWPwvmVw9BVRYot0','KinV0dFrRyqcPaP6vj6j','CN4CmUBolaShGxq1XBCc','ra9RC3yM5pyXlnFyvfds','u0QtzOPF659XKcw4zmaC','AWB672Bdm1c3zepCFHN1','DDxa0fzjKaA5VsBwFSWh','tL24ZOOfrroUFIJwdMrU','MaC6ClsT6OPSCJBfzp6W','kQzxg0QoIqlcjQyy8V0J','zSVPcnqHoKJTcFXzng2h','yzmKeCDnSU5TmiqseH0F','N027oDM1y4IndgjxnFcU','nF7FwBLaUXN6IzpUCncO','xNGUHpe60knqJ33eET50','C0rjZiYF4b9gRBbg2HtA','9o6d8afaungVQQElGa9M','mtvVl3KC4L6sq6isjsEQ','AACNN0viAJTs6t6PD0RP','yHidOFDbLA4kIng3Kdu4','la0pXQFvYCKLXUvPeAIE','pj8l7NXLZ87JeWnkXk4A','ONst50xSTSv5z3TdfwyJ','benB2U8EEtFFe5YSXmXQ','GRlKSzxy6Jlgbfcd1rnV','9y7H5PW8jrShDtXioAkm','loHR48mSRaXL0HGden3g','ArwjaOsS5k3RK1xN0upJ','kiE4ey6Ym15GjfJSAD9z','vYzo3MWR94951yqEmQUr','bwUWAMoRaD8mE9AVWiWo','JYdJvJJoyjBEBM7L49h0','JOf2Y0pFKbq3C3j7O7qs','0PnJmUvSsmVvavGAVnpx','dPCYl67BDiO9OSdGH26d','O01XcKDKmccLrER3RUIR','soYSKWeVdZ28yeV6dhIN','dFe9v7AFD9USRpVpCtUn','6zzXT6jaNNlnSgjeMS1b','1qUn9vN5zfDBWNx2bLC2','TKOYYir7QQqSQExRhPMW','pqUGlcnMFLYu6DpRt8x6','xCBZ6Ic0qizUnW6aqA7n','3Q2uW6stoncIkiFU0VJM','48gM7McHQ4mUdmW9ZOTp','nCX52iW3WZDn1gTbxcHV','Vi9B2PfGdvYAccgZGbR6','rdvVUzSpRMw2zHtSnGTY','Ku68oEbYBOTYuCjb52mn','1ygIevS3KzMbutey77yJ','GtPO77Dic0Hc8syraZ5F','am2mxSDunF06K6sCb57i','fa0xpbpVEcdVlPbtbzYu','ASosTOrZxaTHOoFySBxi','761PVOyniRU2U48bheAD','5DxiPd9KlSLYzgEILtKu','jVL4pcDTpABLa8UbqZjh','ZBHsXUADZ24dspaHsyl6','4IrWOHZxcdQlF6OBiTGm','yLBRIXQEGCH5sKTaQqTg','tvbsu6gVI5NnTeQPUvio','KmcD7KbThfr2b23uhACF','FVFFocKvtrnNMylS3f57','xRsbiv5B5fzuGVbDymaf','euIpuEHITa3Ki71ceNOf','PPlFYoDj9Z9nwuKbozGs','3n7V0L6RBs3iGqWI3rZh','iDDgeTV9KFLsiGZsd9vM','RFdsnwYK8a54VzFkquXB','WqBqXJpfmg9k3LjaHGZv','xpXK6nzeh9AWFHDNV7NZ','OmtLtjvZa9MYajdmMYaA','Le3mmIxKu3sVSodzaJSD','oZomuLm7f7RDyNnNCMm0','RNmjdnTCVnx24Hh9ldO9','DCTcwVPklkK5vxFrXSJw','ZXdW4GGZTb0DGrtx2v7j','0SNu2cvNNzI0PuaGSSBh','dhl8616CgFn3Qxi7MZRa','duv9jW2WmQqtQZGwf3ft','kmEqHewUbncJz5l8IEsY','sUqQPb79y4M86XX4Y7k0','llIEqwKZQaHhVSRMBk2P','gc3rHLFS3NqSnqWL2LPd','k98eLCBuUXFA7bYHxqVh','uWkZauXD73FPgX9xlrU8','vHCGrMgpObhbXg053Mo3','uizXuRDL5hSVs7NMu3ka','OUuSCbsRczsfFkt10BSE','axNWnNEbG9HUwx3xUzQd','X6BF6CpSyJaGOzKPKDu5','zz0nsL8lTZTkgd7t8hZW','M8q2QeAUJ13nEwzdGGUn','f5T8BhxJXahO4RQX0vfi','qb6bnYbA0PcZsFLZjXjf','ABXdFUHjHyaRETyUyoTl','aKJsIJ9tMMlRsxWm7rji','jx2WcnkO9lcHLDhQ4nci','XiNM3U4rerxAAxN25sN6','tssFcRm2n6urwukaoYEU','gGzzC6NjIbFEsUKn3uAh','A5XavrRtrcnjL09XtV4K','BekLL5jw0umD4tu834NB','1FYMqAEm3xCCtiwz9X77','GI5JpIdW3ZNSQUCxkdst','GVuCD3bcrvyQfBqcSvlY','njrluYYusVEZAX0uZ9HJ','vQ2AKTnX6UxsvoIhKeyF','JBgZcXx4aBpnaGru3ibk','hVUAMtUmiDzwNkK6UBJI','0jaRmzh7OttccdxUFu5s','NgJlFobFRzpt8IxtVkBx','3bDf97kNTGlJmqvUc0hK','hFjRJwLtNgw3bPKwFUT8','qVfM4k9PZBOdUmM2ojtK','ruMQyEj5TyT0QzhbBDHz','wG0z7CHqtxKJ5gp766i9','cXoBuPRlYsa3Cy58Nlm9','G4h5LNn6eQYL9jAqqA6C','D6uP5ur0vscrXghBB2jU','6pdOoe7McpF36OXVq2rd','ToFkC2q5tpHjU8KAhx43','pKo8tCfRyVjARHdQsWYK','hrFMSkkf2aCP9xmnm12t','C15PRuEPrLefNbLGJxD6','BG1Hi6AD3JMBmkr2eIvj','NU3R1Anhg5YEW1edNBFL','4bf4R3JUFgD8JsVBeait','myzFBfJLSeSl0JmhdFd0','wJzzNHvyeWRMhUWTrD5i','89SFLfo5SmYlyit1kL7k','H8dX7nMicI8g38jFipDA','OgPGQ0YMFGceDNlV4PUX','vmx4RL3VJeoWnUA8G0E6','YraxlwQZ5DeXhuLIp9Vk','djm8bnJS4JBbTzKzkuGV','mL4hnUFd96PjAJZ9O58a','PjNNaZv6BuDIHJ5ZOlzM','rlCTFYNrq26p6IUnpq3F','S4gBz7Rde68G7bzsaf6Q','fe7pF0mqbP9XrJvhvRK5','5JH7Iykbr22ZrPPvhuwT','AJaHPXbQ67wCQ8Yv3S8z','s6NMasmt5beYJhImmODv','oMLdUaafCzIBqvAUqZxD','Tz3EFSzlbyiIOSmLh40o','xb1QGlwqE15sinnXuuGl','yZ0foawhuGcIvB5RruRX','JLsFm1aJfSRJhzMXKn0A','KOp4DIZ7VncrN4vpIegJ','k1A4SpNgfukqYLwZADHU','GSnwemvP0zQ584jcl0Gt','CB6oTLBBw9y2jDs2U80z','5tS1XsEMifYMmUh1XZYl','SGOlJDMdnfQh3oOrjlm3','oKXNpmg4XDSIqm5r737p','O2uGcY9F3pwzjgkLzHf9','L3wZ7iqctZ4WygNzA5sX','Vs0Icwfqz5ZBXKXdhow5','ZEaAnYaRGt2Zy3dD3uR1','NyrjWN6lkLCb3gMe6mUx','ClGmqsiy1YScsBUtKbgi','vd9tB1rHPuz7Dpu7VNpW','4PMH8x49r89FRzUXKWYc','zL7SPNHvVgdbI67K6MgP','DWEZ1hqCmh9HCgflWQWV','7T3jmBecU6RafIV6k06J','uPWp7vBXx986BadIy8Oq','GillBkTlfi2bA4GUPAPe','NBAgjRyJR8Va30kB7qR2','uaWOh0UFQD7OPGsZaL0r','o4RifMO8My2FmPPfcCIL','y3OsNC2astFVh761TMCT','E90QN6pGNq8s5SkqEPrK','DaT6qCv63xuaPKTaTUMh','Z5gdH42wmLeNMj542Mji','Wxv6ZjUSAUjM1Teu5XGH','hggXbjBBYCvSfDIuGhfb','IVMsW9Ak0yNRId2zUZJH','9ZwcetV5eiBkjssKSBtr','UdxVyJPhDKuENcxDbvOJ','jKDTOGQtVTzP3jIIHnEm','Ky33YVwvMyWaKbHWMS9c','ZQaG999kpnvhGcCznRVp','c8ADvwI3sscCe1024SsE','Bd3nOOk7Kh65K9QGlZxw','Nbk3fe7fmTFcRpxVrcV2','p3X84glpJOIiwswXsL60','AHp3C7dqSYRPcPaMlCqn','eCxHHjeVKukXKYJtnWan','gUWItdsFismNEq1NH9Mv','i6AVan26i4nMOl9akmyd','B69e9O4IjwEeqpC6wPve','e1MuJWfMyUvS8TY6iFbm','w7yylezas40xYqBZKhL6','ivocxyEAfdEQJC5uQWBA','asV9OjrCufW4xiBNADNb','vRcNajVfECtzk5LQgsbs','lI5IElORaL72RHXBaPPx','cRmesTvk7MWuiU9fFn5E','QGhohhL6sOykLXIrlgkV','9yhSXf1FzMGV1nBB8imd','ZdlBY0E7PXWGDL12e6C4','W5IHMhxsX6PnsS0hXVtP','LhyQpgFCkEPwxXA8JJRc','u4tAySH8UtCROh16KYxU','HWJ9xxkYH6gLvTGQwzCR','nqhX72kgedMvCBHwbukU','fDhFsTMV3r9pIOoRaVnG','A1fIH9BVN1hhgxnoPkZ6','SfA6mtaMu4Uov4IJr1tK','6D7fWcVT0onZctuyZQhA','T9F623VpSQfqtCxXBzTE','zXc96ylGjtWyule4WDTn','KOrzTOs5iJhDci5luenf','EotCObJmkBH1Md7OZvZL','8KvKmg3OBHHTh2uQi7h3','n7osDLNUOmpEie8m4cb3','jkYpTjUNlp1rzkWfZUvd','hG0FhAHiPDCsBQAsHD3z','zoJxQlXTX2SsQHgigZnX','eeNODe5rWgXhR8al2Ok2','RjNLTDLlwnYVv9QGhSzH','y84oh6ZgDSSA5VqW9ARV','eQWGueBnsOy2rAbvvmbX','PTw2PkZBpZj4YOp6RNzG','0wHmuzDRLBPcmpbRBAMl','HKcur8DxIjx0iv0hfPQF','i6HIp8LXeg3LMwoY24p3','nnk9TzSvB8nlZ9J7y9jh','2rNk4uaNVyqqje1WKaNP','WSAbImraBJzfBT6zWujZ','YJbxoihxprfjDdEJmN8V','mnSpjO6Ep7mn6rLCSAiu','2ldQe23lx2D5iBTLyAo4','p0zc8PMapbFsZXaQGKDc','Uwqlo03jkN7dVIpOahRv','jmBbRHuDcDWMnN7DBwab','H1cykPQEFAq6HFt0oVnc','L3YUCk1TlWMdEYeTJrR9','dPrwgvl4L4cH1LF0rYTs','IZCzVYCW5sUZKCI7oaOC','ObLFzOySeepvReY43Qmx','tcUUbCW5GGDJYENtJ995','ec6sQrv4CiPkfKaQXjV5','AfcUcji9IDgZDbcvZzhM','x0JoRccN19XIkuPCQW3B','YaHQrWhPqtbz1ut6bQ7P','KTzYLOBGwvnSbbGNDlTu','ht7kyVMv4HWQlLnXHDv4','QItylfmh13QIBXmWmjUz','IUmdgq2ezep5fF1qZfV6','WJVMC4sFo3IYzInadgEp','ofKdt5ITDMxKM8lRYdjp','9onbPza6CVM75GSkIpDj','ixH6lweQXhVL172K6olf','8fE1vLFnxSDvl2XrJ8aC','YpXXFHKVc20BoQ6xEbsv','yiRgou9lq9KVy9z4wXne','z9Ks3TJ4LC3Fq13Jde4g','rQwiSk4LIZYNipcpNWC5','HgCwRZ4zbi13Og1oYPFP','RBxEgKJCMA34wU99jTVa','aoXDUqcYlVReVUUzoxdQ','E1sVVLwv1R65JO4sKyWh','t3h6Ui1JWKQSiBnsG7Em','NoGoJpTJ7eTVcdSPr4ry','KdlGrr7CFey8VBjCk9eE','Ptiy1NoglO6Etd7SStHw','Y7j71MCV1gCvDpUvQVqV','HAQPgfGfpNJY3QydDyox','z7bL1StcYKTJJUXAO7RE','zMuk2CBpMptj4cKtEhmY','h6YgloeorCS0PdTca7WQ','ivrmoTCfdP65fkrQ2vaI','yjWLi8FlkGHtf45N1WeL','gZYhl8FjctcOojKVsN1z','nv4uYzsia3mftxY7aCHw','8xZa0fuiuGxb8iaEZr3g','HooQvQPn8FJbfKcsYYXS','6BHBCecdcqSxCMp4tAQW','AtUG67XQpjTHWPAlXPO3','yjlbwAVBubPAkJVQVfcL','v4I4DlWNh2ggZAJEj0un','l8AMazdQaCPE7JJm8zh7','DRxYNo5VANM77euwKfPM','AP4dwWyX4ODtKcGFCYn6','lyBXPC7qEydvZ2kLUsPC','fIQWGv4YHQaEC0W0KM43','gB3uiLBxnwC7no3MvI5p','eieC7yRxHmlYCvoFWVfJ','4WN9uhVIBOPK81ouX67v','DvxCiV9yCDbfjNH20FZj','riBfy1Uvw7U1w2jLIQ6M','bcbAEQjEKEyPD9FoaMnJ','HYDNfCSPxI1jJ9PNcGgR','7F01odoLUaAsz1eBXUSr','6YvDHJLnaMJT2S37TehL','FQM9jOFUbEdxqWP8EBDC','qbmRr8EOtC4MKeaKWU7L','BAuNBP6KDCK8RTOhsfNS','si32IlYhKyXEnAKmB4Ol','fcMHNW78TVoEXKxO2gt2','4YgcmJwNyE5mJeNiXzoF','zaBmXUtX7PvD2g34wllh','QbkUTH1JCtv5FXy64vnn','v4KmePFpmv7BmRuUdvPP','TKWrmOtTAZ0k8sZjC3gI','bqp6NqxjzgiEkp5Z90fZ','XCp8ShqU2sE9Y84x5YoW','vhHMFDSJcrY0dfzaz0XJ','z2OlM5zZiwUxibwDRQ5c','PawZp3ycYFeHdujIhaSP','2h9CpqmmMj48SuaOKNiU','CvM9Jy36cplHripeibiE','KWn6DhRsuE6L7LnFBsJD','15WLRGXVOQk8ueLPL4nw','dy99WLkjeXpyb2sb6TN1','gcDAiLMi1eut1zMzniaV','OX27ODjRXwMxoQDGxuPa','1sacqIo1uYrlhZxwY927','rEMU95A4bwcnrTRmtwA4','Q5FBUKZvLgZ0RSkpUZyd','NtqRIiSkK1xaWZHRn0lx','JVJcJfYd4WowSBgWka9H','TWYvbdPlS24uR4F2dSP8','OYWSLSoRU98FkhgcCre4','4Tllg4Z2h5MZHtpLmcj4','85Qd4ssrKYFkPqkr5qyz','oGH0oOCowtBQpr9tuFln','CXG1WuPU0qgXrjlqaGEQ','cJTRqHkzClk7Zt1AW3FI','x0xHiQ65oapQxjVHvaUY','5pPdISOGJIrkXAlvLJI8','X63Lw0C7G07bvWphXu09','od9avtFKYt9bG3J5mwXl','Um9GSAYdTTQXhXLx9rB8','jjNFnlNBBYBo9AJr8baK','ZmdNFwk95fEWar9dcyqA','IuZZb1zHpDWxCA93aHmR','WoeHRH0kNzVSp52eoQae','BAw0fofqBra7qV6IRn2Y','C1gmXoMOnZmyW947dDkL','4aQmIGWRuvraYAC6SRl6','LZBewSK8wg870oTDYOLJ','Ef52ex6eoDdFAsOJd9sU','RSjIUmzSgRUOHj4P5QLs','LPPpZ8sibwxQo3y5lLl2','XmzZPMPlfcAvUI7hmQcV','uJs3MxmHsAhKKc2VCQVw','PEEFkyKF9ExkkqGKCgjt','Py8xjIXFloLXUEiqXObQ','2GLSh4R8NFZbC8DsPOeS','smmCTbMpw7vKTU3BS69j','hf7CIlOU6nUrBJtyVzUJ','uxMYAc3SYI0bZ990Qut5','QBLpiRjAVpYLUoLrZEFk','vYpQZnH2n1jntnJfdZDm','TQ3XJ67BPRpmtr749LUL','yPuiJwvykWMJ0GQTx8tw','Tl7i36oTxFCvaeOwHA4X','VwHa96I8Nnq3ECbVJ8hN','MJTSIFNP1T4JgdFCJ5zf','Nxd4df5576e8oVsKwmaO','BLWcqKSjobVQ1MMGjjXm','8o3IC90IGxmhov2CfOZU','GSSfDZ4GUfZ8jCCiOjqW','sIXvjv5bKdn5Z87qkzsK','cwQ88dyFeKxiyIbaqufz','VTpMSFWXVjYVBObUfUOj','w0r50e9AClJ0GoAYV6du','D2FcmCZN1W5jFw99pNES','Imrsz6bZXbXRxKh4nYIx','zV6o1qddL0wxiikirC7T','JnpG0ZUhEAmszAx10ewe','etW4p8eGzdwySmmCVnZv','MFOVHQgXETTVICc1xpPa','xjRMBMaEGZ62NZqt3lUb','JmRqytkHCOZMXwbSo0zY','Z48QqXXl8hydLNGhWalT','sHDEq41FhC03gPhJk2Ae','n4IJ2udY84WugeQfYnS5','1MPWuJQXvz3SErorspvo','zsHaDFeKwKiJikuloPHq','sALpJNh08vNAdx3x8COB','2kNqbKfRzjjXxhAVKnns','ySXMqfDfw4NByNa8xout','CS1MQ8qsEcr5wZUlQw2v','E2qVO1tFGPoz9tXaeTyJ','6g1szq80IqcB6Yf4EhKf','UtNHhckTEKqp31Po8SDr','1OXqrlMqvCL7Jw3BtcaO','7jpNhKrvEP0kD4KqC0mZ','Sj8ujdNLzgup1c4aWKNY','kUXRdBGH6h32zN0uq5Pr','UGMkpPVW47PYUkt5yKMS','j2JdA84B9ztVxBoM1ScK','e8FDNcDLewBVTwVUBc06','c766LEysUd3DNQgBoLey','wmdfEcfxbBvOWNy8dm4z','cgIFnYi8cPlVZMDKlvOf','GjcptTp0ZeGIOi3YrvZa','s6lLHmL4J5wxIHVL3rwI','TErZKWDxpOKUEppSlhMs','2jRxi26bxDEtUdIIfq1j','5O4mtYqoyd1M2xPpa8ms','tpIj9GSmydAnrN204wf0','S8Fp7mMve1aXFPThVvm1','b48hxgsMQZ67U4kntxxU','2vgIpcbibxhcRh9AkgWn','kFuWJX0jvWg7KpT4mmRp','QjGKWWvJoH5dDnamzEkG','gtjddQbvo8R1B4hI9WFr','r8H71SwBh4s6VkQW1jMQ','9rX5LoEiTLoW70lvHlA7','mpJRMV20b4oa0fshyXab','wwjXeFRyxOSTEpduELQV','cYXDUj7w7taBc83E5p3X','R9CwH4K6n4YvcLegcNtn','OmezTqmzstk5J0uJ74q7','XAGGSTQm8BYht447wKeC','keTQEm4VsfnasxypTvE4','QBvFxgSqq0m8aGKDMQmG','plaOMYHFWVPmam3TK6Cv','M7YYZiF4irU18uWu4gAu','HvYfg93kB2GeUMM1COm9','wvo7LglJWqd9JMnONNMM','YfwXU2odqKpwU4pTVCSM','VGmjppah1kLL2hC6keq2','QP6GsOVwhTjb9PtA3JNw','KkYUCOsdQ0rvNV7wzqVi','2a5RNVDSVmXhfXbtrQp7','UzNI0ncybGmAy63ctgCT','w5hm0LG2AKgYmo0IXCdT','MoNwUjmiChclrdGwcL3e','uBdXUdEufDW0M6mqoS7H','o5UhRVwqUym8rSaxdDDH','TKFzsNJFVnWD45frZOCY','utucAPJ61ledNui4N0J7','crMqBIprQ9X7xKeE8sCF','x9f6rWcb3btY9jPQV9mk','baycUyWMk4kYclKTnHUM','53cJtWUiJde2MFc9OX4p') AND sc.lesson_id = '220'
        GROUP BY รหัสใบรับรอง
        ORDER BY FIELD(รหัสใบรับรอง, 'xglvXrBqgqvp0gpxBDeY','VNDvGz3djJKPodrlIegQ','VXJlI3fHQX0yFzcAMXOC','f7sVnKN7tGlBozM0jJKO','eQQcfGb7dWtHd29VhrNB','Qb8FHDDBlE6SdStkN8c4','FZlelyTfLbsqEXqPEmeW','zYQOGpAyEb2RMfIyMFi7','epcyKhVmiuPz36PUzf13','xhW31u6UlYdvFJjDu0KM','CXbAVphs6W2V28s6kV6s','AKBXUKH1GhZtnj5ErEEE','bOojEl73aehBfWNlNk3a','24DulKcmdhVJ4jzcVemy','LNwe2xJlQYkce2THq431','UxnOVrkDlcTtgqLmdmjx','AtpJO0KTm8OkLl0jTOWD','3BDlA8WzHYr3OSZlBQ4v','t0H1BOBOfYA2j2PvLiF6','TEHKLb1fcs6NT3M5aBpA','TaRHhJ6gfDQoVx3mR1cQ','i4HEKZYQJiJo3qxAqQ1f','yqtXPmZuxjtSiF6HLfRw','dCpXGgrgsDgCzkELQAyI','y8U2B4Z5XXjcFDbvuAWN','NjTflF3HQrl6DTYgOAjc','uoIAErhgsCo1At5cxEYY','k1KImipXpArGGQ2zfnup','BVtmrUFkdZXRoXzK0fSI','zO8KbioDv5t06Hwih4jo','PNZshgeqelF5U0R7P6AL','kEsxXzgs241DRI7a2j9n','FqMPk98Rfagn82P1i2q5','1he5kYDvCL5kt7G3ArWs','CbonJZVjhrh9tcq83Lyk','JnmhyUqEVPYtpeg8Q8Oz','dCs5xYIQ5K4La5DSNQRf','vlKOVMRLo12EyLH201d9','C0c4GrTRKXSLOQEyYxAK','CQ6QCFjgeL9egED3sUzB','htJCAzP06qpOED4usN4i','OTMsFbsCyyrKxFjZvZrx','YJFHr2c8lpR6hOr8Wrig','ILxuv3I2YWdvVRx6jm9c','kfMU1LLR2Gyt3cnw4gQD','YyX2RbHahM8zIGB9h3LY','Ek87Dh8PIKDb5vCGHo6N','FWPy36O53f4KQ8E9qeTM','lmUGjtqgpGRaIKlQWO0G','H0xRYcZtIsVRmh0Wars0','Qqg8anzvfSwtbRSTD9xh','MOe2nZOSeQ9dVgRG7Bm3','iUYRm1fUcbByNsLKEJXW','FCIOv5FzrbYbgztHTEWJ','xBJQQLeAF2iZtbzqVVLM','T9bwCWPwvmVw9BVRYot0','KinV0dFrRyqcPaP6vj6j','CN4CmUBolaShGxq1XBCc','ra9RC3yM5pyXlnFyvfds','u0QtzOPF659XKcw4zmaC','AWB672Bdm1c3zepCFHN1','DDxa0fzjKaA5VsBwFSWh','tL24ZOOfrroUFIJwdMrU','MaC6ClsT6OPSCJBfzp6W','kQzxg0QoIqlcjQyy8V0J','zSVPcnqHoKJTcFXzng2h','yzmKeCDnSU5TmiqseH0F','N027oDM1y4IndgjxnFcU','nF7FwBLaUXN6IzpUCncO','xNGUHpe60knqJ33eET50','C0rjZiYF4b9gRBbg2HtA','9o6d8afaungVQQElGa9M','mtvVl3KC4L6sq6isjsEQ','AACNN0viAJTs6t6PD0RP','yHidOFDbLA4kIng3Kdu4','la0pXQFvYCKLXUvPeAIE','pj8l7NXLZ87JeWnkXk4A','ONst50xSTSv5z3TdfwyJ','benB2U8EEtFFe5YSXmXQ','GRlKSzxy6Jlgbfcd1rnV','9y7H5PW8jrShDtXioAkm','loHR48mSRaXL0HGden3g','ArwjaOsS5k3RK1xN0upJ','kiE4ey6Ym15GjfJSAD9z','vYzo3MWR94951yqEmQUr','bwUWAMoRaD8mE9AVWiWo','JYdJvJJoyjBEBM7L49h0','JOf2Y0pFKbq3C3j7O7qs','0PnJmUvSsmVvavGAVnpx','dPCYl67BDiO9OSdGH26d','O01XcKDKmccLrER3RUIR','soYSKWeVdZ28yeV6dhIN','dFe9v7AFD9USRpVpCtUn','6zzXT6jaNNlnSgjeMS1b','1qUn9vN5zfDBWNx2bLC2','TKOYYir7QQqSQExRhPMW','pqUGlcnMFLYu6DpRt8x6','xCBZ6Ic0qizUnW6aqA7n','3Q2uW6stoncIkiFU0VJM','48gM7McHQ4mUdmW9ZOTp','nCX52iW3WZDn1gTbxcHV','Vi9B2PfGdvYAccgZGbR6','rdvVUzSpRMw2zHtSnGTY','Ku68oEbYBOTYuCjb52mn','1ygIevS3KzMbutey77yJ','GtPO77Dic0Hc8syraZ5F','am2mxSDunF06K6sCb57i','fa0xpbpVEcdVlPbtbzYu','ASosTOrZxaTHOoFySBxi','761PVOyniRU2U48bheAD','5DxiPd9KlSLYzgEILtKu','jVL4pcDTpABLa8UbqZjh','ZBHsXUADZ24dspaHsyl6','4IrWOHZxcdQlF6OBiTGm','yLBRIXQEGCH5sKTaQqTg','tvbsu6gVI5NnTeQPUvio','KmcD7KbThfr2b23uhACF','FVFFocKvtrnNMylS3f57','xRsbiv5B5fzuGVbDymaf','euIpuEHITa3Ki71ceNOf','PPlFYoDj9Z9nwuKbozGs','3n7V0L6RBs3iGqWI3rZh','iDDgeTV9KFLsiGZsd9vM','RFdsnwYK8a54VzFkquXB','WqBqXJpfmg9k3LjaHGZv','xpXK6nzeh9AWFHDNV7NZ','OmtLtjvZa9MYajdmMYaA','Le3mmIxKu3sVSodzaJSD','oZomuLm7f7RDyNnNCMm0','RNmjdnTCVnx24Hh9ldO9','DCTcwVPklkK5vxFrXSJw','ZXdW4GGZTb0DGrtx2v7j','0SNu2cvNNzI0PuaGSSBh','dhl8616CgFn3Qxi7MZRa','duv9jW2WmQqtQZGwf3ft','kmEqHewUbncJz5l8IEsY','sUqQPb79y4M86XX4Y7k0','llIEqwKZQaHhVSRMBk2P','gc3rHLFS3NqSnqWL2LPd','k98eLCBuUXFA7bYHxqVh','uWkZauXD73FPgX9xlrU8','vHCGrMgpObhbXg053Mo3','uizXuRDL5hSVs7NMu3ka','OUuSCbsRczsfFkt10BSE','axNWnNEbG9HUwx3xUzQd','X6BF6CpSyJaGOzKPKDu5','zz0nsL8lTZTkgd7t8hZW','M8q2QeAUJ13nEwzdGGUn','f5T8BhxJXahO4RQX0vfi','qb6bnYbA0PcZsFLZjXjf','ABXdFUHjHyaRETyUyoTl','aKJsIJ9tMMlRsxWm7rji','jx2WcnkO9lcHLDhQ4nci','XiNM3U4rerxAAxN25sN6','tssFcRm2n6urwukaoYEU','gGzzC6NjIbFEsUKn3uAh','A5XavrRtrcnjL09XtV4K','BekLL5jw0umD4tu834NB','1FYMqAEm3xCCtiwz9X77','GI5JpIdW3ZNSQUCxkdst','GVuCD3bcrvyQfBqcSvlY','njrluYYusVEZAX0uZ9HJ','vQ2AKTnX6UxsvoIhKeyF','JBgZcXx4aBpnaGru3ibk','hVUAMtUmiDzwNkK6UBJI','0jaRmzh7OttccdxUFu5s','NgJlFobFRzpt8IxtVkBx','3bDf97kNTGlJmqvUc0hK','hFjRJwLtNgw3bPKwFUT8','qVfM4k9PZBOdUmM2ojtK','ruMQyEj5TyT0QzhbBDHz','wG0z7CHqtxKJ5gp766i9','cXoBuPRlYsa3Cy58Nlm9','G4h5LNn6eQYL9jAqqA6C','D6uP5ur0vscrXghBB2jU','6pdOoe7McpF36OXVq2rd','ToFkC2q5tpHjU8KAhx43','pKo8tCfRyVjARHdQsWYK','hrFMSkkf2aCP9xmnm12t','C15PRuEPrLefNbLGJxD6','BG1Hi6AD3JMBmkr2eIvj','NU3R1Anhg5YEW1edNBFL','4bf4R3JUFgD8JsVBeait','myzFBfJLSeSl0JmhdFd0','wJzzNHvyeWRMhUWTrD5i','89SFLfo5SmYlyit1kL7k','H8dX7nMicI8g38jFipDA','OgPGQ0YMFGceDNlV4PUX','vmx4RL3VJeoWnUA8G0E6','YraxlwQZ5DeXhuLIp9Vk','djm8bnJS4JBbTzKzkuGV','mL4hnUFd96PjAJZ9O58a','PjNNaZv6BuDIHJ5ZOlzM','rlCTFYNrq26p6IUnpq3F','S4gBz7Rde68G7bzsaf6Q','fe7pF0mqbP9XrJvhvRK5','5JH7Iykbr22ZrPPvhuwT','AJaHPXbQ67wCQ8Yv3S8z','s6NMasmt5beYJhImmODv','oMLdUaafCzIBqvAUqZxD','Tz3EFSzlbyiIOSmLh40o','xb1QGlwqE15sinnXuuGl','yZ0foawhuGcIvB5RruRX','JLsFm1aJfSRJhzMXKn0A','KOp4DIZ7VncrN4vpIegJ','k1A4SpNgfukqYLwZADHU','GSnwemvP0zQ584jcl0Gt','CB6oTLBBw9y2jDs2U80z','5tS1XsEMifYMmUh1XZYl','SGOlJDMdnfQh3oOrjlm3','oKXNpmg4XDSIqm5r737p','O2uGcY9F3pwzjgkLzHf9','L3wZ7iqctZ4WygNzA5sX','Vs0Icwfqz5ZBXKXdhow5','ZEaAnYaRGt2Zy3dD3uR1','NyrjWN6lkLCb3gMe6mUx','ClGmqsiy1YScsBUtKbgi','vd9tB1rHPuz7Dpu7VNpW','4PMH8x49r89FRzUXKWYc','zL7SPNHvVgdbI67K6MgP','DWEZ1hqCmh9HCgflWQWV','7T3jmBecU6RafIV6k06J','uPWp7vBXx986BadIy8Oq','GillBkTlfi2bA4GUPAPe','NBAgjRyJR8Va30kB7qR2','uaWOh0UFQD7OPGsZaL0r','o4RifMO8My2FmPPfcCIL','y3OsNC2astFVh761TMCT','E90QN6pGNq8s5SkqEPrK','DaT6qCv63xuaPKTaTUMh','Z5gdH42wmLeNMj542Mji','Wxv6ZjUSAUjM1Teu5XGH','hggXbjBBYCvSfDIuGhfb','IVMsW9Ak0yNRId2zUZJH','9ZwcetV5eiBkjssKSBtr','UdxVyJPhDKuENcxDbvOJ','jKDTOGQtVTzP3jIIHnEm','Ky33YVwvMyWaKbHWMS9c','ZQaG999kpnvhGcCznRVp','c8ADvwI3sscCe1024SsE','Bd3nOOk7Kh65K9QGlZxw','Nbk3fe7fmTFcRpxVrcV2','p3X84glpJOIiwswXsL60','AHp3C7dqSYRPcPaMlCqn','eCxHHjeVKukXKYJtnWan','gUWItdsFismNEq1NH9Mv','i6AVan26i4nMOl9akmyd','B69e9O4IjwEeqpC6wPve','e1MuJWfMyUvS8TY6iFbm','w7yylezas40xYqBZKhL6','ivocxyEAfdEQJC5uQWBA','asV9OjrCufW4xiBNADNb','vRcNajVfECtzk5LQgsbs','lI5IElORaL72RHXBaPPx','cRmesTvk7MWuiU9fFn5E','QGhohhL6sOykLXIrlgkV','9yhSXf1FzMGV1nBB8imd','ZdlBY0E7PXWGDL12e6C4','W5IHMhxsX6PnsS0hXVtP','LhyQpgFCkEPwxXA8JJRc','u4tAySH8UtCROh16KYxU','HWJ9xxkYH6gLvTGQwzCR','nqhX72kgedMvCBHwbukU','fDhFsTMV3r9pIOoRaVnG','A1fIH9BVN1hhgxnoPkZ6','SfA6mtaMu4Uov4IJr1tK','6D7fWcVT0onZctuyZQhA','T9F623VpSQfqtCxXBzTE','zXc96ylGjtWyule4WDTn','KOrzTOs5iJhDci5luenf','EotCObJmkBH1Md7OZvZL','8KvKmg3OBHHTh2uQi7h3','n7osDLNUOmpEie8m4cb3','jkYpTjUNlp1rzkWfZUvd','hG0FhAHiPDCsBQAsHD3z','zoJxQlXTX2SsQHgigZnX','eeNODe5rWgXhR8al2Ok2','RjNLTDLlwnYVv9QGhSzH','y84oh6ZgDSSA5VqW9ARV','eQWGueBnsOy2rAbvvmbX','PTw2PkZBpZj4YOp6RNzG','0wHmuzDRLBPcmpbRBAMl','HKcur8DxIjx0iv0hfPQF','i6HIp8LXeg3LMwoY24p3','nnk9TzSvB8nlZ9J7y9jh','2rNk4uaNVyqqje1WKaNP','WSAbImraBJzfBT6zWujZ','YJbxoihxprfjDdEJmN8V','mnSpjO6Ep7mn6rLCSAiu','2ldQe23lx2D5iBTLyAo4','p0zc8PMapbFsZXaQGKDc','Uwqlo03jkN7dVIpOahRv','jmBbRHuDcDWMnN7DBwab','H1cykPQEFAq6HFt0oVnc','L3YUCk1TlWMdEYeTJrR9','dPrwgvl4L4cH1LF0rYTs','IZCzVYCW5sUZKCI7oaOC','ObLFzOySeepvReY43Qmx','tcUUbCW5GGDJYENtJ995','ec6sQrv4CiPkfKaQXjV5','AfcUcji9IDgZDbcvZzhM','x0JoRccN19XIkuPCQW3B','YaHQrWhPqtbz1ut6bQ7P','KTzYLOBGwvnSbbGNDlTu','ht7kyVMv4HWQlLnXHDv4','QItylfmh13QIBXmWmjUz','IUmdgq2ezep5fF1qZfV6','WJVMC4sFo3IYzInadgEp','ofKdt5ITDMxKM8lRYdjp','9onbPza6CVM75GSkIpDj','ixH6lweQXhVL172K6olf','8fE1vLFnxSDvl2XrJ8aC','YpXXFHKVc20BoQ6xEbsv','yiRgou9lq9KVy9z4wXne','z9Ks3TJ4LC3Fq13Jde4g','rQwiSk4LIZYNipcpNWC5','HgCwRZ4zbi13Og1oYPFP','RBxEgKJCMA34wU99jTVa','aoXDUqcYlVReVUUzoxdQ','E1sVVLwv1R65JO4sKyWh','t3h6Ui1JWKQSiBnsG7Em','NoGoJpTJ7eTVcdSPr4ry','KdlGrr7CFey8VBjCk9eE','Ptiy1NoglO6Etd7SStHw','Y7j71MCV1gCvDpUvQVqV','HAQPgfGfpNJY3QydDyox','z7bL1StcYKTJJUXAO7RE','zMuk2CBpMptj4cKtEhmY','h6YgloeorCS0PdTca7WQ','ivrmoTCfdP65fkrQ2vaI','yjWLi8FlkGHtf45N1WeL','gZYhl8FjctcOojKVsN1z','nv4uYzsia3mftxY7aCHw','8xZa0fuiuGxb8iaEZr3g','HooQvQPn8FJbfKcsYYXS','6BHBCecdcqSxCMp4tAQW','AtUG67XQpjTHWPAlXPO3','yjlbwAVBubPAkJVQVfcL','v4I4DlWNh2ggZAJEj0un','l8AMazdQaCPE7JJm8zh7','DRxYNo5VANM77euwKfPM','AP4dwWyX4ODtKcGFCYn6','lyBXPC7qEydvZ2kLUsPC','fIQWGv4YHQaEC0W0KM43','gB3uiLBxnwC7no3MvI5p','eieC7yRxHmlYCvoFWVfJ','4WN9uhVIBOPK81ouX67v','DvxCiV9yCDbfjNH20FZj','riBfy1Uvw7U1w2jLIQ6M','bcbAEQjEKEyPD9FoaMnJ','HYDNfCSPxI1jJ9PNcGgR','7F01odoLUaAsz1eBXUSr','6YvDHJLnaMJT2S37TehL','FQM9jOFUbEdxqWP8EBDC','qbmRr8EOtC4MKeaKWU7L','BAuNBP6KDCK8RTOhsfNS','si32IlYhKyXEnAKmB4Ol','fcMHNW78TVoEXKxO2gt2','4YgcmJwNyE5mJeNiXzoF','zaBmXUtX7PvD2g34wllh','QbkUTH1JCtv5FXy64vnn','v4KmePFpmv7BmRuUdvPP','TKWrmOtTAZ0k8sZjC3gI','bqp6NqxjzgiEkp5Z90fZ','XCp8ShqU2sE9Y84x5YoW','vhHMFDSJcrY0dfzaz0XJ','z2OlM5zZiwUxibwDRQ5c','PawZp3ycYFeHdujIhaSP','2h9CpqmmMj48SuaOKNiU','CvM9Jy36cplHripeibiE','KWn6DhRsuE6L7LnFBsJD','15WLRGXVOQk8ueLPL4nw','dy99WLkjeXpyb2sb6TN1','gcDAiLMi1eut1zMzniaV','OX27ODjRXwMxoQDGxuPa','1sacqIo1uYrlhZxwY927','rEMU95A4bwcnrTRmtwA4','Q5FBUKZvLgZ0RSkpUZyd','NtqRIiSkK1xaWZHRn0lx','JVJcJfYd4WowSBgWka9H','TWYvbdPlS24uR4F2dSP8','OYWSLSoRU98FkhgcCre4','4Tllg4Z2h5MZHtpLmcj4','85Qd4ssrKYFkPqkr5qyz','oGH0oOCowtBQpr9tuFln','CXG1WuPU0qgXrjlqaGEQ','cJTRqHkzClk7Zt1AW3FI','x0xHiQ65oapQxjVHvaUY','5pPdISOGJIrkXAlvLJI8','X63Lw0C7G07bvWphXu09','od9avtFKYt9bG3J5mwXl','Um9GSAYdTTQXhXLx9rB8','jjNFnlNBBYBo9AJr8baK','ZmdNFwk95fEWar9dcyqA','IuZZb1zHpDWxCA93aHmR','WoeHRH0kNzVSp52eoQae','BAw0fofqBra7qV6IRn2Y','C1gmXoMOnZmyW947dDkL','4aQmIGWRuvraYAC6SRl6','LZBewSK8wg870oTDYOLJ','Ef52ex6eoDdFAsOJd9sU','RSjIUmzSgRUOHj4P5QLs','LPPpZ8sibwxQo3y5lLl2','XmzZPMPlfcAvUI7hmQcV','uJs3MxmHsAhKKc2VCQVw','PEEFkyKF9ExkkqGKCgjt','Py8xjIXFloLXUEiqXObQ','2GLSh4R8NFZbC8DsPOeS','smmCTbMpw7vKTU3BS69j','hf7CIlOU6nUrBJtyVzUJ','uxMYAc3SYI0bZ990Qut5','QBLpiRjAVpYLUoLrZEFk','vYpQZnH2n1jntnJfdZDm','TQ3XJ67BPRpmtr749LUL','yPuiJwvykWMJ0GQTx8tw','Tl7i36oTxFCvaeOwHA4X','VwHa96I8Nnq3ECbVJ8hN','MJTSIFNP1T4JgdFCJ5zf','Nxd4df5576e8oVsKwmaO','BLWcqKSjobVQ1MMGjjXm','8o3IC90IGxmhov2CfOZU','GSSfDZ4GUfZ8jCCiOjqW','sIXvjv5bKdn5Z87qkzsK','cwQ88dyFeKxiyIbaqufz','VTpMSFWXVjYVBObUfUOj','w0r50e9AClJ0GoAYV6du','D2FcmCZN1W5jFw99pNES','Imrsz6bZXbXRxKh4nYIx','zV6o1qddL0wxiikirC7T','JnpG0ZUhEAmszAx10ewe','etW4p8eGzdwySmmCVnZv','MFOVHQgXETTVICc1xpPa','xjRMBMaEGZ62NZqt3lUb','JmRqytkHCOZMXwbSo0zY','Z48QqXXl8hydLNGhWalT','sHDEq41FhC03gPhJk2Ae','n4IJ2udY84WugeQfYnS5','1MPWuJQXvz3SErorspvo','zsHaDFeKwKiJikuloPHq','sALpJNh08vNAdx3x8COB','2kNqbKfRzjjXxhAVKnns','ySXMqfDfw4NByNa8xout','CS1MQ8qsEcr5wZUlQw2v','E2qVO1tFGPoz9tXaeTyJ','6g1szq80IqcB6Yf4EhKf','UtNHhckTEKqp31Po8SDr','1OXqrlMqvCL7Jw3BtcaO','7jpNhKrvEP0kD4KqC0mZ','Sj8ujdNLzgup1c4aWKNY','kUXRdBGH6h32zN0uq5Pr','UGMkpPVW47PYUkt5yKMS','j2JdA84B9ztVxBoM1ScK','e8FDNcDLewBVTwVUBc06','c766LEysUd3DNQgBoLey','wmdfEcfxbBvOWNy8dm4z','cgIFnYi8cPlVZMDKlvOf','GjcptTp0ZeGIOi3YrvZa','s6lLHmL4J5wxIHVL3rwI','TErZKWDxpOKUEppSlhMs','2jRxi26bxDEtUdIIfq1j','5O4mtYqoyd1M2xPpa8ms','tpIj9GSmydAnrN204wf0','S8Fp7mMve1aXFPThVvm1','b48hxgsMQZ67U4kntxxU','2vgIpcbibxhcRh9AkgWn','kFuWJX0jvWg7KpT4mmRp','QjGKWWvJoH5dDnamzEkG','gtjddQbvo8R1B4hI9WFr','r8H71SwBh4s6VkQW1jMQ','9rX5LoEiTLoW70lvHlA7','mpJRMV20b4oa0fshyXab','wwjXeFRyxOSTEpduELQV','cYXDUj7w7taBc83E5p3X','R9CwH4K6n4YvcLegcNtn','OmezTqmzstk5J0uJ74q7','XAGGSTQm8BYht447wKeC','keTQEm4VsfnasxypTvE4','QBvFxgSqq0m8aGKDMQmG','plaOMYHFWVPmam3TK6Cv','M7YYZiF4irU18uWu4gAu','HvYfg93kB2GeUMM1COm9','wvo7LglJWqd9JMnONNMM','YfwXU2odqKpwU4pTVCSM','VGmjppah1kLL2hC6keq2','QP6GsOVwhTjb9PtA3JNw','KkYUCOsdQ0rvNV7wzqVi','2a5RNVDSVmXhfXbtrQp7','UzNI0ncybGmAy63ctgCT','w5hm0LG2AKgYmo0IXCdT','MoNwUjmiChclrdGwcL3e','uBdXUdEufDW0M6mqoS7H','o5UhRVwqUym8rSaxdDDH','TKFzsNJFVnWD45frZOCY','utucAPJ61ledNui4N0J7','crMqBIprQ9X7xKeE8sCF','x9f6rWcb3btY9jPQV9mk','baycUyWMk4kYclKTnHUM','53cJtWUiJde2MFc9OX4p')
        `;
        const requestBody = {
          query: {
            mainQuery: query
          }
        };
        
        try {
          const response = await fetch('http://localhost:5002/api/04ZQdW5sGA9C9eXXXk6x/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          const data = await response.json();
          this.listItems = data.data.map(item => ({
            ...item,
            loaded: false,
            imageStatus: ''
          }));
          await this.loadImages();
          this.loading = true;
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      },
      async loadImages() {
      const MAX_CONCURRENT_REQUESTS = 10;
      let currentIndex = 0;
      const queue = [];

      while (currentIndex < this.listItems.length) {
        while (queue.length < MAX_CONCURRENT_REQUESTS && currentIndex < this.listItems.length) {
          const item = this.listItems[currentIndex];
          if (!item.loaded) {
            queue.push(this.checkImage(item.รูปประจำตัว).then(result => {
              item.loaded = true;
              item.imageStatus = result ? 'loaded' : 'error';
            }));
          }
          currentIndex++;
        }
        await Promise.race(queue);
        queue.shift();
      }
    },
      async checkImage(url) {
        try {
          await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = reject;
            image.src = url;
          });
          return true;
        } catch {
          return false;
        }
      },
      async formattedAddress(item) {
        let delay = 5000; // 5 seconds
        let retry = 50;
        let response;
        let addressObj;

        while (retry > 0) {
          try {
            response = await fetch(`https://faas-sgp1-18bc02ac.doserverless.co/api/v1/web/fn-3bf765c8-bb4f-4bac-ba41-9698000f7334/default/unserialize?name=${encodeURIComponent(item)}`);
            addressObj = await response.json();
            return `เลขที่ ${addressObj.mailinG_NO} ม. ${addressObj.mailinG_MOO} ซ. ${addressObj.mailinG_SOI_TH} ถ. ${addressObj.mailinG_ROAD_TH} ต. ${addressObj.mailinG_SUB_DISTRICT_TH} อ. ${addressObj.mailinG_DISTRICT_TH}`;
          } catch (error) {
            console.error(error);
            if (response && response.status === 429) {
              console.warn(`Too many requests, retrying after ${delay} ms`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
            retry--;
          }
        }
        return '';
      },
      exportTable() {
        const table = document.getElementById('my-table');
        const rows = table.querySelectorAll('tr');

        // Get the column names from the <th> elements in the <thead> section
        const columnNames = [];
        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach(cell => {
          columnNames.push(cell.textContent);
        });

        // Build the data array by iterating over the rows
        const data = [];
        rows.forEach(row => {
          const rowData = [];
          row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.innerText);
          });
          data.push(rowData);
        });

        // Prepend the column names to the data array
        data.unshift(columnNames);

        // Convert the data to CSV format
        const csvRows = [];
        data.forEach(row => {
          const csvRow = row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',');
          csvRows.push(csvRow);
        });
        const csvData = csvRows.join('\n');

        // Download the CSV file
        const link = document.createElement('a');
        link.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`);
        link.setAttribute('download', 'my-table.csv');
        link.click();
      },
      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        await this.fetchData();

        // Batch the items into groups of 100 and add a delay of 2 seconds between each group
        const batchSize = 100;
        const delay = 2000;
        const batches = [];
        for (let i = 0; i < this.listItems.length; i += batchSize) {
          batches.push(this.listItems.slice(i, i + batchSize));
        }

        // Process each batch of items in the queue
        for (let i = 0; i < batches.length; i++) {
          const batch = batches[i];

          // Map each item to a Promise that fetches the formatted address
          const promises = batch.map(item => {
            return this.formattedAddress(item.ที่อยู่).then(address => {
              item.formattedAddress = address;
            });
          });

          // Wait for all Promises to settle before continuing to the next batch
          await Promise.allSettled(promises);

          // Wait for the specified delay before processing the next batch
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }

      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>

  <breadcrumbs v-if="loading_sources"
  :navigation="
  [
    {
      name: 'ย้อนกลับ',
      link: '/asset/index/',
      style: 'chevron-left'
    },
    {
      name: 'เพิ่มผู้ดูแลระบบ',
      link: '/asset/user/add/',
      style: 'plus'
    }
  ]"
  /> 

  <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t" v-if="loading_sources">
    <div class="mt-8">
      <div class="sm:px-6 lg:px-6">

        <div class="mt-8 flex flex-col">
          <div class="">
            <div class=" py-2 align-middle md:px-6 lg:px-8">

              <div class="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <button @click="exportTable">Export to Excel</button>

                <table class="min-w-full divide-y divide-gray-300" id="my-table" v-if="loading">
                  <thead class="bg-gray-50">
                    <tr>
                      <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">#</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">prefix</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ชื่อ</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">นามสกล</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">เลขประจำตัวประชาชน</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">รหัสใบรับรอง</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">หมายเลขใบรับรอง</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">หลักสูตร</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">รูปประจำตัว</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">วันออกใบรับรอง</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">วันหมดอายุ</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ที่อยู่</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">จังหวัด</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">รหัสไปรษณีย์</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">โทร</th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">loaded</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    <tr v-for="(cert, index) in listItems" :key="cert._id">
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{index+1}} - {{cert.sid}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.prefix }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.ชื่อ }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.นามสกล}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.เลขประจำตัวประชาชน}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.รหัสใบรับรอง}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.หมายเลขใบรับรอง}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.หลักสูตร}}</td>
                        <!-- <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.รูปประจำตัว.replace('https://content.fti.academy/doa-academy/1639435666414290693/', '') }}</td> -->
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.รูปประจำตัว}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.วันออกใบรับรอง}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.วันหมดอายุ}}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.formattedAddress }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.จังหวัด }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.รหัสไปรษณีย์ }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.โทร }}</td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ cert.imageStatus }}</td>
                    </tr>

                  </tbody>
                </table>

              </div>
              
            </div>
          </div>
        </div>


    </div>
  </div>
</div>
</template>