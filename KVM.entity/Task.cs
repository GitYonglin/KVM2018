using LiteDB;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;

namespace KVM.entity
{
    /// <summary>
    /// ������
    /// </summary>
    public class Task : Base
    {
        /// <summary>
        /// ����ĿID
        /// </summary>
        public string ProjectId { get; set; }
        /// <summary>
        /// ������
        /// </summary>
        public string BridgeName { get; set; }
        /// <summary>
        /// ʹ�øֽ���ID
        /// </summary>
        public string SteelStrandId { get; set; }
        /// <summary>
        /// ʹ���豸ID
        /// </summary>
        public string DeviceId { get; set; }
        /// <summary>
        /// ����ID
        /// </summary>
        public string ComponentId { get; set; }
        /// <summary>
        /// ������ID
        /// </summary>
        public string HoleId { get; set; }
        /// <summary>
        /// �Կ���
        /// </summary>
        public string skNumber { get; set; }
        /// <summary>
        /// �Կ�ǿ��
        /// </summary>
        public string skIntensity { get; set; }
        /// <summary>
        /// ���ǿ��
        /// </summary>
        public string DesignIntensity { get; set; }
        /// <summary>
        /// ����ǿ��
        /// </summary>
        public string TensionIntensity { get; set; }
        /// <summary>
        /// ��������
        /// </summary>
        public DateTime ConcretingDate { get; set; }
        /// <summary>
        /// Ħ��ϵ��
        /// </summary>
        public string Friction { get; set; }
        /// <summary>
        /// ������������ϸ
        /// </summary>
        [BsonIgnore]
        public IEnumerable<HoleGroup> HoleGroups { get; set; }
        /// <summary>
        /// ����������
        /// </summary>
        [BsonIgnore]
        public IEnumerable<HoleGroupsRadio> HoleGroupsRadio { get; set; }
        /// <summary>
        /// ʹ���豸��ϸ
        /// </summary>
        [BsonIgnore]
        public Device Device { get; set; }
        /// <summary>
        /// �ֽ�����ϸ
        /// </summary>
        [BsonIgnore]
        public SteelStrand SteelStrand { get; set; }
        /// <summary>
        /// �����Լ�����ϸ
        /// </summary>
        [BsonIgnore]
        public Component Component { get; set; }
        /// <summary>
        /// �׵���ϸ
        /// </summary>
        [BsonIgnore]
        public Hole Hole { get; set; }
    }
    /// <summary>
    /// ����������
    /// </summary>
    public class HoleGroup : Subset
    {
        /// <summary>
        /// ������
        /// </summary>
        public string Name { get; set; }
        /// <summary>
        /// ����ģʽ
        /// </summary>
        public int Mode { get; set; }
        //public float SuperTensionStageValue { get; set; }
        /// <summary>
        /// ������
        /// </summary>
        public float TensionKn { get; set; }
        /// <summary>
        /// /��������
        /// </summary>
        public float TensionLength { get; set; }
        /// <summary>
        /// �ֽ�������
        /// </summary>
        public int SteelStrandNumber { get; set; }
        /// <summary>
        /// ��������
        /// </summary>
        public string TensionStage { get; set; }
        /// <summary>
        /// �����׶�
        /// </summary>
        public IEnumerable<int> TensionStageValue { get; set; }
        /// <summary>
        /// ��ѹʱ��
        /// </summary>
        public IEnumerable<int> Time { get; set; }
        /// <summary>
        /// ������
        /// </summary>
        public Boolean Super { get; set; }
        /// <summary>
        /// ��������
        /// </summary>
        public Boolean Twice { get; set; }
        /// <summary>
        /// A1����
        /// </summary>
        public ModeGroup A1 { get; set; }
        /// <summary>
        /// A2����
        /// </summary>
        public ModeGroup A2 { get; set; }
        /// <summary>
        /// B1����
        /// </summary>
        public ModeGroup B1 { get; set; }
        /// <summary>
        /// B2����
        /// </summary>
        public ModeGroup B2 { get; set; }
    }
    /// <summary>
    /// ������
    /// </summary>
    public class ModeGroup
    {
        /// <summary>
        /// �������쳤��
        /// </summary>
        public float WorkMm { get; set; }
        /// <summary>
        /// ������
        /// </summary>
        public float RetractionMm { get; set; }
        /// <summary>
        /// �����쳤��
        /// </summary>
        public float TheoryMm { get; set; }
    }
    /// <summary>
    /// ������������
    /// </summary>
    public class HoleGroupsRadio
    {
        /// <summary>
        /// ������ID
        /// </summary>
        public string Id { get; set; }
        /// <summary>
        /// ������
        /// </summary>
        public string Hole { get; set; }
        /// <summary>
        /// ����״̬
        /// </summary>
        public int State { get; set; }
    }
    public class ConpomentHole
    {
        public string ComponetnName { get; set; }
        public Hole Hole { get; set; }
    }

    public class CopyTask
    {
        public string Id { get; set; }
        public string BridgeName { get; set; }
        public string HoleId { get; set; }
        public string ProjectId { get; set; }
    }

    public class Export
    {
        public IEnumerable<HoleGroup> HoleGroups { get; set; }
        public IEnumerable<Record> Records { get; set; }
    }
}
