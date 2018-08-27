using LiteDB;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace KVM.LiteDB.DAL.Task.HoleGroup
{
    public class RHoleGroup : RSubset<entity.HoleGroup>, IHoleGroup
    {
        private LiteCollection<entity.HoleGroup> _col;
        public RHoleGroup(IOptions<DbString> dbString) : base(dbString)
        {
            _col = DbCollection<entity.HoleGroup>();
        }

        /// <summary>
        /// ����һ������
        /// </summary>
        /// <param name="id">Id</param>
        /// <param name="data">���µ�����</param>
        /// <returns>�ɹ���������Ŀ�����в���Ա��ʧ�ܣ��Ż�״̬false</returns>
        public ReturnPost UpData(entity.HoleGroup data)
        {
            var searchData = _col.Find(item => item.Name == data.Name);
            if (searchData.Count() == 0 || (searchData.Count() == 1 && searchData.Select(s => s.Id == data.Id).Count() == 1))
            {
                var old = _col.FindById(data.Id);
                var updata = Class2Class.C2C(old, data);
                if (_col.Update(updata))
                {
                    return new ReturnPost() { Data = FindGetAll(updata.ParentId), Message = true };
                }
            }
            return new ReturnPost() { Message = false };
        }
    }
}
