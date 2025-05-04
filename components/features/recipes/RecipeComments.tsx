import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

interface Comment {
  id: number
  user: {
    id: number
    name: string
    avatar: string
  }
  content: string
  rating: number
  date: string
}

interface RecipeCommentsProps {
  comments: Comment[]
}

export default function RecipeComments({ comments }: RecipeCommentsProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">评论 ({comments.length})</h2>

      {/* Comment Form */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-2">添加评论</h3>
        <div className="flex items-center mb-3">
          <span className="mr-2">评分:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary hover:fill-primary"
              />
            ))}
          </div>
        </div>
        <Textarea placeholder="分享你的想法..." className="mb-3" />
        <Button>提交评论</Button>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b pb-6 last:border-b-0">
            <div className="flex items-start">
              <Avatar className="mr-3">
                <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} />
                <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium">{comment.user.name}</div>
                  <div className="text-sm text-muted-foreground">{comment.date}</div>
                </div>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < comment.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <p>{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
