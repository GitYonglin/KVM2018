using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace KVM.LiteDB.DAL.Component.Hole
{
    public class RHole : RSubset<entity.Hole>, IHole
    {
        private LiteCollection<entity.Hole> _col;
        public RHole(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.Hole>();
        }

        /// <summary>
        /// ���һ������
        /// </summary>
        /// <param name="data">����</param>
        /// <returns></returns>
        public new ReturnPost Insert(entity.Hole data)
        {
            if (_col.FindOne(h => h.ParentId == data.ParentId && h.sName == data.sName) == null)
            {
                data.Id = Guid.NewGuid().ToString();
                _col.Insert(data);
                var rdata = _col.Find(h => h.ParentId == data.ParentId);
                return new ReturnPost() { Data = rdata, Message = true };
            }
            return new ReturnPost() { Message = false };
        }

        /// <summary>
        /// �޸�һ������
        /// </summary>
        /// <param name="id">Id</param>
        /// <param name="data">����</param>
        /// <returns></returns>
        public ReturnPost UpData(entity.Hole data)
        {
            var searchData = _col.Find(h => h.ParentId == data.ParentId && h.sName == data.sName);
            if (searchData.Count() == 0 || (searchData.Count() == 1 && searchData.Select(s => s.Id == data.Id).Count() == 1))
            {
                var old = _col.FindById(data.Id);
                var updata = Class2Class.C2C(old, data);
                if (_col.Update(updata))
                {
                    var rdata = _col.Find(h => h.ParentId == data.ParentId);
                    return new ReturnPost() { Data = rdata, Message = true };
                }
            }
            return new ReturnPost() { Message = false };
        }
    }
}
