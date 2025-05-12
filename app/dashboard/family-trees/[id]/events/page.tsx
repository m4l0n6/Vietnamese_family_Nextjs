"use client"

import { useParams, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Plus, Calendar, CalendarDays, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Event {
  id: string
  title: string
  description?: string
  date: string
  location?: string
  type: string
  memberId?: string
  memberName?: string
}

export default function EventsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const familyTreeId = params.id as string
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [familyName, setFamilyName] = useState("Gia phả")
  const [activeTab, setActiveTab] = useState("all")
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    type: "family",
  })
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  // Lấy tab từ URL nếu có
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && (tabParam === "all" || tabParam === "family" || tabParam === "personal")) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch family tree info
        const familyResponse = await fetch(`/api/family-trees/${familyTreeId}`)
        if (familyResponse.ok) {
          const familyData = await familyResponse.json()
          setFamilyName(familyData.name)
        }

        // Giả lập dữ liệu sự kiện - trong thực tế sẽ lấy từ API
        setTimeout(() => {
          const mockEvents = [
            {
              id: "1",
              title: "Ngày giỗ tổ",
              description: "Lễ giỗ tổ hàng năm của dòng họ",
              date: "2023-10-15",
              location: "Đền thờ họ Nguyễn, Hà Nội",
              type: "family",
            },
            {
              id: "2",
              title: "Sinh nhật",
              description: "Sinh nhật của Nguyễn Văn A",
              date: "1980-05-20",
              type: "personal",
              memberId: "member1",
              memberName: "Nguyễn Văn A",
            },
            {
              id: "3",
              title: "Ngày mất",
              description: "Ngày mất của cụ Nguyễn Văn B",
              date: "2010-08-12",
              location: "Hà Nội",
              type: "personal",
              memberId: "member2",
              memberName: "Nguyễn Văn B",
            },
            {
              id: "4",
              title: "Ngày cưới",
              description: "Lễ cưới của Nguyễn Văn C và Trần Thị D",
              date: "2005-11-30",
              location: "Hà Nội",
              type: "family",
            },
          ]

          setEvents(mockEvents)
          setLoading(false)
        }, 1000)

        // Trong thực tế sẽ gọi API như sau:
        // const response = await fetch(`/api/family-trees/${familyTreeId}/events`)
        // if (!response.ok) throw new Error("Failed to fetch events")
        // const data = await response.json()
        // setEvents(data)
      } catch (error) {
        console.error("Error fetching events:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải dữ liệu sự kiện",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [familyTreeId, toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const handleAddEvent = () => {
    // Trong thực tế sẽ gọi API để thêm sự kiện
    const newId = Date.now().toString()
    const eventToAdd = {
      id: newId,
      ...newEvent,
      date: newEvent.date || new Date().toISOString().split("T")[0],
    } as Event

    setEvents([...events, eventToAdd])
    setNewEvent({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      type: "family",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Thành công",
      description: "Đã thêm sự kiện mới",
    })
  }

  const handleEditEvent = () => {
    if (!editingEvent) return

    // Trong thực tế sẽ gọi API để cập nhật sự kiện
    const updatedEvents = events.map((event) => (event.id === editingEvent.id ? editingEvent : event))

    setEvents(updatedEvents)
    setEditingEvent(null)
    setIsEditDialogOpen(false)

    toast({
      title: "Thành công",
      description: "Đã cập nhật sự kiện",
    })
  }

  const handleDeleteEvent = (id: string) => {
    // Trong thực tế sẽ gọi API để xóa sự kiện
    const updatedEvents = events.filter((event) => event.id !== id)
    setEvents(updatedEvents)

    toast({
      title: "Thành công",
      description: "Đã xóa sự kiện",
    })
  }

  const filteredEvents = activeTab === "all" ? events : events.filter((event) => event.type === activeTab)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link href={`/dashboard/family-trees/${familyTreeId}`}>
          <Button variant="outline" size="sm" className="w-fit gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </Button>
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Sự kiện: {familyName}</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                <span>Thêm sự kiện</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Thêm sự kiện mới</DialogTitle>
                <DialogDescription>Nhập thông tin chi tiết về sự kiện mới</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Tiêu đề
                  </Label>
                  <Input
                    id="title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Ngày
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Địa điểm
                  </Label>
                  <Input
                    id="location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Loại
                  </Label>
                  <select
                    id="type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="family">Sự kiện gia đình</option>
                    <option value="personal">Sự kiện cá nhân</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="button" onClick={handleAddEvent} disabled={!newEvent.title}>
                  Thêm sự kiện
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">Quản lý các sự kiện quan trọng trong lịch sử gia đình</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="family">Sự kiện gia đình</TabsTrigger>
          <TabsTrigger value="personal">Sự kiện cá nhân</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                <span>Danh sách sự kiện</span>
              </CardTitle>
              <CardDescription>
                {activeTab === "all" && "Tất cả các sự kiện trong gia phả"}
                {activeTab === "family" && "Các sự kiện liên quan đến toàn bộ gia đình"}
                {activeTab === "personal" && "Các sự kiện liên quan đến từng cá nhân"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Chưa có sự kiện nào</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Bắt đầu thêm các sự kiện quan trọng vào gia phả của bạn.
                  </p>
                  <Button className="mt-4 gap-2" onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                    <span>Thêm sự kiện đầu tiên</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEvents.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatDate(event.date)}</div>
                          {event.type === "personal" && event.memberName && (
                            <div className="text-xs text-muted-foreground mt-1">{event.memberName}</div>
                          )}
                        </div>
                      </div>
                      {event.location && (
                        <div className="mt-2 text-xs text-muted-foreground">Địa điểm: {event.location}</div>
                      )}
                      <div className="mt-4 flex justify-end gap-2">
                        <Dialog
                          open={isEditDialogOpen && editingEvent?.id === event.id}
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open)
                            if (!open) setEditingEvent(null)
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => setEditingEvent(event)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              <span>Sửa</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Chỉnh sửa sự kiện</DialogTitle>
                              <DialogDescription>Cập nhật thông tin chi tiết về sự kiện</DialogDescription>
                            </DialogHeader>
                            {editingEvent && (
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-title" className="text-right">
                                    Tiêu đề
                                  </Label>
                                  <Input
                                    id="edit-title"
                                    value={editingEvent.title}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-date" className="text-right">
                                    Ngày
                                  </Label>
                                  <Input
                                    id="edit-date"
                                    type="date"
                                    value={editingEvent.date.split("T")[0]}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-location" className="text-right">
                                    Địa điểm
                                  </Label>
                                  <Input
                                    id="edit-location"
                                    value={editingEvent.location || ""}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-type" className="text-right">
                                    Loại
                                  </Label>
                                  <select
                                    id="edit-type"
                                    value={editingEvent.type}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value })}
                                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <option value="family">Sự kiện gia đình</option>
                                    <option value="personal">Sự kiện cá nhân</option>
                                  </select>
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                  <Label htmlFor="edit-description" className="text-right">
                                    Mô tả
                                  </Label>
                                  <Textarea
                                    id="edit-description"
                                    value={editingEvent.description || ""}
                                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                                    className="col-span-3"
                                    rows={3}
                                  />
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditDialogOpen(false)
                                  setEditingEvent(null)
                                }}
                              >
                                Hủy
                              </Button>
                              <Button type="button" onClick={handleEditEvent}>
                                Lưu thay đổi
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="gap-1">
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Xóa</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác. Sự kiện này sẽ bị xóa vĩnh viễn.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Xóa</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
