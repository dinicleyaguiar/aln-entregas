"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function DeleteListButton({id}:{id:number}) { const router=useRouter(); const [loading,setLoading]=useState(false); async function remove(){if(!confirm("Excluir esta lista e todos os nomes? Esta ação não pode ser desfeita."))return; setLoading(true); const response=await fetch(`/api/admin/lists/${id}`,{method:"DELETE"}); if(response.ok){router.push("/admin/listas");router.refresh();}else{setLoading(false);alert("Não foi possível excluir a lista.");}} return <button onClick={remove} disabled={loading} className="btn btn-danger">{loading?"Excluindo...":"Excluir lista"}</button>; }
