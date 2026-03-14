import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Loader from "./Loader";
import {
  FaUsers,
  FaChartLine,
  FaFileDownload,
  FaUserGraduate,
  FaSignOutAlt,
} from "react-icons/fa";

const subjects = [
  "Mathematics",
  "English",
  "Kiswahili",
  "Science",
  "Agriculture",
  "Social Studies",
  "Pretechnical Studies",
  "Creative Arts",
  "Religious Studies",
];

const grades = ["4","5","6","7","8","9"];
const terms = ["Term 1", "Term 2", "Term 3"];

const sidebar = {
  width: 230,
  background: "#87CEEB",
  color: "#001f3f",
  padding: 20,
  height: "100vh",
  position: "fixed",
  fontFamily: "Times New Roman, serif",
};

const main = {
  marginLeft: 250,
  padding: 20,
  minHeight: "100vh",
  background: "linear-gradient(135deg,#cce7ff,#87CEEB)",
  color: "#001f3f",
  fontFamily: "Times New Roman, serif",
};

function getGrade(mark) {
  if (mark >= 81) return "EE";
  if (mark >= 61) return "ME";
  if (mark >= 41) return "AE";
  return "BE";
}

export default function App() {
  const [page, setPage] = useState("login");
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [teacher, setTeacher] = useState("");
  const [teacherName, setTeacherName] = useState("");

  const [learners, setLearners] = useState([]);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("4");
  const [term, setTerm] = useState("Term 1");
  const [selected, setSelected] = useState("");

  const [comment, setComment] = useState("");

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000); // show loader 1s

    const savedLearners = JSON.parse(localStorage.getItem("learners")) || [];
    const savedTeacher = JSON.parse(localStorage.getItem("teacher")) || null;
    const savedComments = JSON.parse(localStorage.getItem("comments")) || {};

    setLearners(savedLearners);

    if (savedTeacher) {
      setTeacher(savedTeacher.email);
      setTeacherName(savedTeacher.name || "");
    }

    setComment(savedComments);
  }, []);

  useEffect(() => {
    localStorage.setItem("learners", JSON.stringify(learners));
    localStorage.setItem("comments", JSON.stringify(comment));
  }, [learners, comment]);

  useEffect(() => {
    if (teacher) {
      localStorage.setItem(
        "teacher",
        JSON.stringify({
          email: teacher,
          name: teacherName,
        })
      );
    }
  }, [teacherName, teacher]);

  /* ACCOUNT */
  function createAccount() {
    if (!email || !password || !confirm) return alert("Fill all fields");
    if (password !== confirm) return alert("Passwords do not match");

    const saved = JSON.parse(localStorage.getItem("teacherLogin")) || [];

    if (saved.find(t => t.email === email)) {
      alert("Email already registered!");
      return;
    }

    localStorage.setItem(
      "teacherLogin",
      JSON.stringify([...saved, { email, password }])
    );

    alert("Account created successfully!");
    setPage("login");
  }

  function login() {
    const saved = JSON.parse(localStorage.getItem("teacherLogin")) || [];

    const found = saved.find(u => u.email === email && u.password === password);

    if (found) {
      setTeacher(email);
      setPage("dashboard");
    } else {
      alert("Wrong login details");
    }
  }

  function logout() {
    setTeacher("");
    setPage("login");
  }

  /* LEARNERS */
  function addLearner() {
    if (!name) return;

    setLearners([...learners, { name, grade, records: { "Term 1": {}, "Term 2": {}, "Term 3": {} } }]);
    setName("");
  }

  function updateMark(student, subject, value) {
    setLearners(prev =>
      prev.map(l => l.name !== student ? l : {
        ...l,
        records: { ...l.records, [term]: { ...l.records[term], [subject]: Number(value) } }
      })
    );
  }

  function avg(l) {
    let total = 0, count = 0;
    subjects.forEach(s => {
      const mark = l.records[term]?.[s];
      if (mark !== undefined) { total += mark; count++; }
    });
    return count ? Math.round(total / count) : 0;
  }

  function totalMarks(l) {
    let total = 0;
    subjects.forEach(s => {
      const mark = l.records[term]?.[s];
      if (mark !== undefined) total += mark;
    });
    return total;
  }

  function ranked() {
    let arr = learners.map(l => ({ ...l, avg: avg(l) }));
    arr.sort((a, b) => b.avg - a.avg);
    return arr.map((l, i) => ({ ...l, rank: i + 1 }));
  }

  const subjectData = subjects.map(s => {
    let total = 0, count = 0;
    learners.forEach(l => {
      const mark = l.records[term]?.[s];
      if (mark !== undefined) { total += mark; count++; }
    });
    return { subject: s, avg: count ? Math.round(total / count) : 0 };
  });

  const learnerData = selected ? subjects.map(s => ({
    subject: s,
    mark: learners.find(l => l.name === selected)?.records[term]?.[s] || 0
  })) : [];

  function reportCard(l) {
    const doc = new jsPDF();
    doc.setFont("times");
    doc.setFontSize(16);
    doc.text("CBE REPORT CARD", 80, 20);
    doc.setFontSize(12);
    doc.text("Learner: " + l.name, 20, 40);
    doc.text("Grade: " + l.grade, 20, 50);
    doc.text("Teacher: " + teacherName, 20, 60);
    doc.text("Term: " + term, 20, 70);
    const rows = subjects.map(s => {
      const mark = l.records[term]?.[s] || "";
      const grade = mark ? getGrade(mark) : "";
      return [s, mark, grade];
    });
    autoTable(doc, { startY: 80, head: [["Subject","Marks","Grade"]], body: rows });
    doc.save(l.name + "_report.pdf");
  }

  if (loading) return <Loader />;

  /* LOGIN PAGE */
  if (page === "login") return (
    <div style={main}>
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1 }}
      >
        Welcome to LEONMUD Tracker
      </motion.h1>
      <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <br/>
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
      <br/>
      <button onClick={login}>Login</button>
      <button onClick={()=>setPage("create")}>Create Account</button>
      <button onClick={()=>alert("Forgot password? Contact admin!")}>Forgot Password</button>
    </div>
  );

  /* CREATE ACCOUNT PAGE */
  if (page === "create") return (
    <div style={main}>
      <h2>Create Teacher Account</h2>
      <input placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <br/>
      <input type="password" placeholder="Password" onChange={e=>setPassword(e.target.value)} />
      <br/>
      <input type="password" placeholder="Confirm Password" onChange={e=>setConfirm(e.target.value)} />
      <br/>
      <button onClick={createAccount}>Create</button>
      <button onClick={()=>setPage("login")}>Back to Login</button>
    </div>
  );

  /* MAIN APP */
  return (
    <div>
      <div style={sidebar}>
        <h2>LEONMUD</h2>
        <p onClick={()=>setPage("dashboard")}><FaChartLine/> Dashboard</p>
        <p onClick={()=>setPage("learners")}><FaUsers/> Learners</p>
        <p onClick={()=>setPage("analytics")}><FaChartLine/> Analytics</p>
        <p onClick={()=>setPage("reports")}><FaFileDownload/> Reports</p>
        <p onClick={()=>setPage("profile")}><FaUserGraduate/> Teacher Profile</p>
        <p onClick={logout}><FaSignOutAlt/> Logout</p>
      </div>

      <div style={main}>
        {page==="dashboard" && (
          <div>
            <motion.h1
              initial={{ opacity:0, y:-20 }}
              animate={{ opacity:1, y:0 }}
            >
              Welcome {teacherName || teacher}!
            </motion.h1>
            <p>This is where real tracking experience happens.</p>
            <h3>Select Term</h3>
            <select onChange={e=>setTerm(e.target.value)} value={term}>
              {terms.map(t=> <option key={t}>{t}</option>)}
            </select>
            <h3>Top Learners</h3>
            <ul>
              {ranked().slice(0,5).map(l=><li key={l.name}>{l.rank}. {l.name} ({l.avg})</li>)}
            </ul>
          </div>
        )}

        {page==="learners" && (
          <div>
            <h2>Add Learner</h2>
            <input placeholder="Learner name" value={name} onChange={e=>setName(e.target.value)} />
            <select value={grade} onChange={e=>setGrade(e.target.value)}>
              {grades.map(g=> <option key={g}>{g}</option>)}
            </select>
            <button onClick={addLearner}>Add</button>

            <table border="1" style={{background:"white",color:"black",overflowX:"auto"}}>
              <thead>
                <tr>
                  <th>Name</th><th>Grade</th>
                  {subjects.map(s=><th key={s}>{s}</th>)}
                  <th>Total</th><th>Average</th><th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {ranked().map(l=><tr key={l.name}>
                  <td>{l.name}</td>
                  <td>{l.grade}</td>
                  {subjects.map(s=><td key={s}>
                    <input type="number" value={l.records[term]?.[s]||""} style={{width:50}}
                      onChange={e=>updateMark(l.name,s,e.target.value)} />
                  </td>)}
                  <td>{totalMarks(l)}</td>
                  <td>{avg(l)}</td>
                  <td><input value={comment[l.name]||""} onChange={e=>{
                    setComment({...comment,[l.name]:e.target.value})
                  }}/></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        )}

        {page==="analytics" && (
          <div>
            <h2>Subject Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="avg" stroke="#001f3f" />
              </LineChart>
            </ResponsiveContainer>
            <h2>Learner Performance</h2>
            <select onChange={e=>setSelected(e.target.value)}>
              <option>Select learner</option>
              {learners.map(l=><option key={l.name}>{l.name}</option>)}
            </select>
            {selected && <ResponsiveContainer width="100%" height={300}>
              <LineChart data={learnerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mark" stroke="#001f3f" />
              </LineChart>
            </ResponsiveContainer>}
          </div>
        )}

        {page==="reports" && (
          <div>
            <h2>Reports</h2>
            <ul>
              {learners.map(l=><li key={l.name}>
                {l.name} <button onClick={()=>reportCard(l)}>Download PDF</button>
              </li>)}
            </ul>
          </div>
        )}

        {page==="profile" && (
          <div>
            <h2>Teacher Profile</h2>
            <p>Email: {teacher}</p>
            <input placeholder="Teacher name" value={teacherName} onChange={e=>setTeacherName(e.target.value)} />
            <p>Total learners: {learners.length}</p>
          </div>
        )}
      </div>
    </div>
  );
}
